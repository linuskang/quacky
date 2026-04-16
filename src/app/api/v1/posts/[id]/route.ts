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

// Shared select for a post node (used for ancestors too)
const postNodeSelect = {
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
    likes: { select: { userId: true } },
    children: {
        where: { isDeleted: false, isHidden: false },
        select: { id: true, type: true },
    },
    // Include one level of parent so reposts/quotes display the original post
    parent: {
        select: {
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
        },
    },
};

function enrichPost(post: any, userId: string) {
    const replyCount = post.children?.filter((c: any) => c.type === "reply").length ?? 0;
    const repostCount = post.children?.filter((c: any) => c.type === "repost").length ?? 0;
    const hasLiked = post.likes?.some((l: any) => l.userId === userId) ?? false;
    return {
        ...post,
        replyCount,
        repostCount,
        hasLiked,
    };
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth.api.getSession(request);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const userId = session.user.id;

    const post = await prisma.post.findUnique({
        where: { id, isDeleted: false },
        select: {
            ...postNodeSelect,
            // For the detail view, also fetch direct reply children
            children: {
                where: { type: "reply", isDeleted: false, isHidden: false },
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
                    likes: { select: { userId: true } },
                    _count: { select: { children: true } },
                },
                orderBy: { createdAt: "asc" },
            },
        },
    });

    if (!post) {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Record unique view
    const isNewView = await prisma.postView.findUnique({
        where: { postId_userId: { postId: id, userId } },
        select: { postId: true },
    });
    if (!isNewView) {
        await prisma.$transaction([
            prisma.postView.create({ data: { postId: id, userId } }),
            prisma.post.update({ where: { id }, data: { viewCount: { increment: 1 } } }),
        ]);
    }

    // Build ancestor chain (walk up parentId links, oldest first, max 5 deep)
    const ancestors: any[] = [];
    let currentParentId = post.parentId;
    while (currentParentId && ancestors.length < 5) {
        const ancestor = await prisma.post.findUnique({
            where: { id: currentParentId },
            select: postNodeSelect,
        });
        if (!ancestor) break;
        ancestors.unshift(enrichPost(ancestor, userId));
        currentParentId = ancestor.parentId;
    }

    // Enrich replies
    const enrichedReplies = (post.children as any[]).map((reply) => ({
        ...reply,
        replyCount: reply._count?.children ?? 0,
        repostCount: 0,
        hasLiked: reply.likes?.some((l: any) => l.userId === userId) ?? false,
    }));

    // Check hasReposted for the main post
    const userRepost = await prisma.post.findFirst({
        where: { type: "repost", authorId: userId, parentId: id },
        select: { id: true },
    });

    const enrichedPost = {
        ...enrichPost(post, userId),
        children: enrichedReplies,
        hasReposted: !!userRepost,
    };

    return NextResponse.json({ post: enrichedPost, ancestors }, { status: 200 });
}
