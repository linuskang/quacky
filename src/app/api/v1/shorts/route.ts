// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://linuskang.au/quacky

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db";
import { auth } from "@/server/auth";
import Discord from "@/server/utilities/discord";

const authorSelect = {
    id: true,
    name: true,
    handle: true,
    image: true,
    verified: true,
};

// GET — paginated shorts feed
export async function GET(request: NextRequest) {
    const session = await auth.api.getSession(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor");
    const take = 10;

    const shorts = await prisma.post.findMany({
        where: {
            type: "short",
            isHidden: false,
            isDeleted: false,
        },
        select: {
            id: true,
            authorId: true,
            author: { select: authorSelect },
            content: true,
            attachments: true,
            viewCount: true,
            createdAt: true,
            likes: { select: { userId: true } },
            children: {
                where: { isDeleted: false, isHidden: false, type: "reply" },
                select: { id: true },
            },
        },
        orderBy: { createdAt: "desc" },
        take,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const userId = session.user.id;

    const enriched = shorts
        .map((short) => {
            const attachments = Array.isArray(short.attachments) ? (short.attachments as any[]) : [];
            const videoAttachment = attachments.find((a: any) => a.kind === "video");
            if (!videoAttachment?.url) return null;

            return {
                id: short.id,
                url: videoAttachment.url as string,
                description: short.content,
                createdAt: short.createdAt,
                author: short.author,
                likeCount: short.likes.length,
                hasLiked: short.likes.some((l) => l.userId === userId),
                commentCount: short.children.length,
                viewCount: short.viewCount,
                isOwn: short.authorId === userId,
            };
        })
        .filter(Boolean);

    const nextCursor = shorts.length === take ? shorts[shorts.length - 1].id : null;

    return NextResponse.json({ shorts: enriched, nextCursor }, { status: 200 });
}

// POST — create a new short
export async function POST(request: NextRequest) {
    const session = await auth.api.getSession(request);
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    try {
        const body = await request.json();
        const { videoKey, videoUrl, videoName, videoSize, description } = body;

        if (!videoKey || !videoUrl) {
            return NextResponse.json({ success: false, error: "Video is required" }, { status: 400 });
        }

        const content = typeof description === "string" ? description.trim().slice(0, 500) : "";

        const short = await prisma.post.create({
            data: {
                type: "short",
                content,
                authorId: session.user.id,
                attachments: [
                    {
                        key: videoKey,
                        url: videoUrl,
                        name: typeof videoName === "string" ? videoName : "short.mp4",
                        mimeType: "video/mp4",
                        kind: "video",
                        size: typeof videoSize === "number" ? videoSize : 0,
                    },
                ],
            },
            select: { id: true },
        });

        void new Discord().send({
            embeds: [{
                title: "Short Created",
                description: content || undefined,
                color: 0xE91E63,
                author: { name: `${session.user.name} (@${(session.user as any).handle})`, icon_url: session.user.image ?? undefined },
                fields: [{ name: "Short ID", value: short.id, inline: true }],
                timestamp: new Date().toISOString(),
            }],
        });

        return NextResponse.json({ success: true, short }, { status: 201 });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
