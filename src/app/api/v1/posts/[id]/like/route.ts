// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db";
import { auth } from "@/server/auth";
import Discord from "@/server/utilities/discord";

// GET — check if current user has liked this post
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth.api.getSession(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const postId = (await params).id;
    const existing = await prisma.like.findFirst({
        where: { userId: session.user.id, postId },
    });

    return NextResponse.json({ liked: !!existing }, { status: 200 });
}

// POST — toggle like
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth.api.getSession(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const postId = (await params).id;
    const userId = session.user.id;

    const existing = await prisma.like.findFirst({
        where: { userId, postId },
    });

    if (existing) {
        // Unlike
        await prisma.like.delete({
            where: { userId_postId: { userId, postId } },
        });
        void new Discord().send({
            embeds: [{
                title: "Post Unliked",
                color: 0x95A5A6,
                author: { name: `${session.user.name} (@${(session.user as any).handle})`, icon_url: session.user.image ?? undefined },
                fields: [{ name: "Post ID", value: postId, inline: true }],
                timestamp: new Date().toISOString(),
            }],
        });
        return NextResponse.json({ success: true, liked: false }, { status: 200 });
    }

    // Like
    const post = await prisma.post.findUnique({
        where: { id: postId },
        select: { authorId: true },
    });

    await prisma.like.create({ data: { userId, postId } });

    // Notify the post author (skip if liking own post)
    if (post && post.authorId !== userId) {
        await prisma.notification.create({
            data: {
                userId: post.authorId,
                actorId: userId,
                type: "post:like",
                postId,
                message: "liked your post.",
            },
        });
    }

    void new Discord().send({
        embeds: [{
            title: "Post Liked",
            color: 0xE91E63,
            author: { name: `${session.user.name} (@${(session.user as any).handle})`, icon_url: session.user.image ?? undefined },
            fields: [{ name: "Post ID", value: postId, inline: true }],
            timestamp: new Date().toISOString(),
        }],
    });

    return NextResponse.json({ success: true, liked: true }, { status: 200 });
}
