// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db";
import { auth } from "@/server/auth";
import { linkHashtagsToPost } from "@/lib/hashtags";

// POST /api/v1/posts/[id]/repost
//   body: {}                          → toggle silent repost
//   body: { quote: true, content }    → create a quote post
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth.api.getSession(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const parentId = (await params).id;
    const userId = session.user.id;

    const original = await prisma.post.findUnique({
        where: { id: parentId, isDeleted: false },
        select: { id: true, authorId: true },
    });

    if (!original) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    const body = await request.json().catch(() => ({}));

    // ── Quote post ────────────────────────────────────────────────────────────
    if (body.quote === true) {
        const content = typeof body.content === "string" ? body.content.trim() : "";
        if (!content || content.length > 280) {
            return NextResponse.json({ error: "Invalid content" }, { status: 400 });
        }

        const quote = await prisma.post.create({
            data: { type: "quote", content, authorId: userId, parentId },
            select: { id: true },
        });

        await linkHashtagsToPost(prisma, quote.id, content);

        if (original.authorId !== userId) {
            await prisma.notification.create({
                data: {
                    userId: original.authorId,
                    actorId: userId,
                    type: "post:quote",
                    postId: quote.id,
                    message: "quoted your post.",
                },
            });
        }

        return NextResponse.json({ success: true, id: quote.id }, { status: 201 });
    }

    // ── Silent repost (toggle) ─────────────────────────────────────────────────
    const existing = await prisma.post.findFirst({
        where: { type: "repost", authorId: userId, parentId },
        select: { id: true },
    });

    if (existing) {
        await prisma.post.delete({ where: { id: existing.id } });
        return NextResponse.json({ success: true, reposted: false }, { status: 200 });
    }

    await prisma.post.create({
        data: { type: "repost", content: "", authorId: userId, parentId },
    });

    if (original.authorId !== userId) {
        await prisma.notification.create({
            data: {
                userId: original.authorId,
                actorId: userId,
                type: "post:repost",
                postId: parentId,
                message: "reposted your post.",
            },
        });
    }

    return NextResponse.json({ success: true, reposted: true }, { status: 201 });
}
