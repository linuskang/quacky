// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

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

const parentSelect = {
    id: true,
    type: true,
    authorId: true,
    author: { select: authorSelect },
    content: true,
    attachments: true,
    viewCount: true,
    createdAt: true,
    isDeleted: true,
    isHidden: true,
};

export async function GET(request: NextRequest) {
    const session = await auth.api.getSession(request);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const posts = await prisma.post.findMany({
        where: {
            // Feed only shows top-level posts, reposts, and quotes — not raw replies
            type: { in: ["post", "repost", "quote"] },
            isHidden: false,
            isDeleted: false,
        },
        select: {
            id: true,
            type: true,
            authorId: true,
            author: { select: authorSelect },
            content: true,
            attachments: true,
            viewCount: true,
            pinned: true,
            readOnly: true,
            isHidden: true,
            isDeleted: true,
            createdAt: true,
            parentId: true,
            // Parent post for reposts and quotes
            parent: { select: parentSelect },
            // Likes (for hasLiked + count)
            likes: { select: { userId: true } },
            // Children for reply/repost counts
            children: {
                where: { isDeleted: false, isHidden: false },
                select: { id: true, type: true },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    // Batch check which posts the current user has reposted
    const postIds = posts.map((p) => p.id);
    const userReposts = await prisma.post.findMany({
        where: {
            type: "repost",
            authorId: session.user.id,
            parentId: { in: postIds },
        },
        select: { parentId: true },
    });
    const repostedIds = new Set(userReposts.map((r) => r.parentId));

    const userId = session.user.id;
    const enriched = posts.map((post) => {
        const replyCount = post.children.filter((c) => c.type === "reply").length;
        const repostCount = post.children.filter((c) => c.type === "repost").length;
        const hasLiked = post.likes.some((l) => l.userId === userId);
        const hasReposted = repostedIds.has(post.id);

        return {
            id: post.id,
            type: post.type,
            author: post.author,
            content: post.content,
            attachments: post.attachments,
            viewCount: post.viewCount,
            pinned: post.pinned,
            readOnly: post.readOnly,
            isHidden: post.isHidden,
            isDeleted: post.isDeleted,
            createdAt: post.createdAt,
            parentId: post.parentId,
            parent: post.parent,
            likes: post.likes,
            replyCount,
            repostCount,
            hasLiked,
            hasReposted,
        };
    });

    return NextResponse.json({ posts: enriched }, { status: 200 });
}

export async function POST(request: NextRequest) {
    const session = await auth.api.getSession(request);

    if (!session) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const rawAttachments = Array.isArray(body.attachments) ? body.attachments : [];
        const attachments = rawAttachments
            .map((att: any) => ({
                key: typeof att?.key === "string" ? att.key : "",
                url: typeof att?.url === "string" ? att.url : "",
                name: typeof att?.name === "string" ? att.name : "file",
                mimeType: typeof att?.mimeType === "string" ? att.mimeType : "application/octet-stream",
                size: typeof att?.size === "number" ? att.size : 0,
                kind: att?.kind === "image" || att?.kind === "video" || att?.kind === "file" ? att.kind : "file",
            }))
            .filter((att: any) => att.key && att.url);

        const content = typeof body.content === "string" ? body.content.trim() : "";

        if (content.length > 280 || (!content && attachments.length === 0)) {
            return NextResponse.json({ success: false, error: "Invalid format" }, { status: 400 });
        }

        if (attachments.length > 3) {
            return NextResponse.json(
                { success: false, error: "A post can have at most 3 attachments" },
                { status: 400 }
            );
        }

        const result = await prisma.post.create({
            data: {
                type: "post",
                content,
                authorId: session.user.id,
                attachments,
            },
            select: { id: true },
        });

        return NextResponse.json({ result }, { status: 201 });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
