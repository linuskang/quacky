// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://linuskang.au/quacky

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db";
import { auth } from "@/server/auth";

const authorSelect = {
    id: true,
    name: true,
    handle: true,
    image: true,
    verified: true,
};

// GET — fetch a single short by ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth.api.getSession(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const short = await prisma.post.findFirst({
        where: { id, type: "short", isDeleted: false, isHidden: false },
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
    });

    if (!short) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const attachments = Array.isArray(short.attachments) ? (short.attachments as any[]) : [];
    const videoAttachment = attachments.find((a: any) => a.kind === "video");

    if (!videoAttachment?.url) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const userId = session.user.id;

    return NextResponse.json({
        short: {
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
        },
    });
}

// DELETE — soft-delete a short (author or admin only)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth.api.getSession(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const short = await prisma.post.findFirst({
        where: { id, type: "short", isDeleted: false },
        select: { authorId: true },
    });

    if (!short) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const isAdmin = session.user.role === "Admin";
    if (short.authorId !== session.user.id && !isAdmin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.post.update({
        where: { id },
        data: { isDeleted: true },
    });

    return NextResponse.json({ success: true });
}
