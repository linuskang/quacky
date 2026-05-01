// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://linuskang.au/quacky

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db";
import { auth } from "@/server/auth";
import { linkHashtagsToPost } from "@/lib/hashtags";
import Discord from "@/server/utilities/discord";

// GET — fetch paginated comments (replies) for a short
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth.api.getSession(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor");
    const take = 20;

    const short = await prisma.post.findFirst({
        where: { id, type: "short", isDeleted: false },
        select: { id: true },
    });

    if (!short) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const comments = await prisma.post.findMany({
        where: {
            parentId: id,
            type: "reply",
            isDeleted: false,
            isHidden: false,
        },
        select: {
            id: true,
            content: true,
            createdAt: true,
            authorId: true,
            author: {
                select: {
                    id: true,
                    name: true,
                    handle: true,
                    image: true,
                    verified: true,
                },
            },
            likes: { select: { userId: true } },
        },
        orderBy: { createdAt: "asc" },
        take,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const userId = session.user.id;

    const enriched = comments.map((c) => ({
        id: c.id,
        content: c.content,
        createdAt: c.createdAt,
        author: c.author,
        likeCount: c.likes.length,
        hasLiked: c.likes.some((l) => l.userId === userId),
        isOwn: c.authorId === userId,
    }));

    const nextCursor = comments.length === take ? comments[comments.length - 1].id : null;

    return NextResponse.json({ comments: enriched, nextCursor });
}

// POST — post a comment on a short
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth.api.getSession(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const content = typeof body.content === "string" ? body.content.trim() : "";

    if (!content || content.length > 280) {
        return NextResponse.json({ error: "Comment must be 1–280 characters" }, { status: 400 });
    }

    const short = await prisma.post.findFirst({
        where: { id, type: "short", isDeleted: false },
        select: { id: true, authorId: true },
    });

    if (!short) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const comment = await prisma.post.create({
        data: {
            type: "reply",
            content,
            authorId: session.user.id,
            parentId: id,
        },
        select: {
            id: true,
            content: true,
            createdAt: true,
            authorId: true,
            author: {
                select: {
                    id: true,
                    name: true,
                    handle: true,
                    image: true,
                    verified: true,
                },
            },
        },
    });

    await linkHashtagsToPost(prisma, comment.id, content);

    void new Discord().send({
        embeds: [{
            title: "Short Comment Posted",
            description: content.length > 100 ? content.slice(0, 100) + "…" : content,
            color: 0x5865F2,
            author: { name: `${session.user.name} (@${(session.user as any).handle})`, icon_url: session.user.image ?? undefined },
            fields: [
                { name: "Comment ID", value: comment.id, inline: true },
                { name: "Short ID", value: id, inline: true },
            ],
            timestamp: new Date().toISOString(),
        }],
    });

    if (short.authorId !== session.user.id) {
        await prisma.notification.create({
            data: {
                userId: short.authorId,
                actorId: session.user.id,
                type: "post:reply",
                postId: comment.id,
                message: "commented on your short.",
            },
        });
    }

    return NextResponse.json({
        success: true,
        comment: {
            id: comment.id,
            content: comment.content,
            createdAt: comment.createdAt,
            author: comment.author,
            likeCount: 0,
            hasLiked: false,
            isOwn: true,
        },
    }, { status: 201 });
}
