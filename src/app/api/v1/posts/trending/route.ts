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

// GET /api/v1/posts/trending — top posts by engagement in the last 7 days
export async function GET(request: NextRequest) {
    const session = await auth.api.getSession(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const userId = session.user.id;

    const posts = await prisma.post.findMany({
        where: {
            isDeleted: false,
            isHidden: false,
            type: { in: ["post", "quote"] },
            createdAt: { gte: sevenDaysAgo },
        },
        select: {
            id: true,
            type: true,
            authorId: true,
            author: { select: authorSelect },
            content: true,
            attachments: true,
            poll: true,
            viewCount: true,
            pinned: true,
            readOnly: true,
            isHidden: true,
            isDeleted: true,
            createdAt: true,
            editedAt: true,
            parentId: true,
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
                    editedAt: true,
                    isDeleted: true,
                    isHidden: true,
                },
            },
            likes: { select: { userId: true } },
            children: {
                where: { isDeleted: false, isHidden: false },
                select: { id: true, type: true },
            },
        },
    });

    // Score: likes + reposts * 2 + replies, then take top 20
    const scored = posts
        .map((p) => {
            const replyCount = p.children.filter((c) => c.type === "reply").length;
            const repostCount = p.children.filter((c) => c.type === "repost").length;
            const likeCount = p.likes.length;
            return { ...p, replyCount, repostCount, _score: likeCount + repostCount * 2 + replyCount };
        })
        .sort((a, b) => b._score - a._score)
        .slice(0, 20);

    const postIds = scored.map((p) => p.id);

    const [userReposts, userBookmarks] = await Promise.all([
        prisma.post.findMany({
            where: { type: "repost", authorId: userId, parentId: { in: postIds } },
            select: { parentId: true },
        }),
        prisma.bookmark.findMany({
            where: { userId, postId: { in: postIds } },
            select: { postId: true },
        }),
    ]);

    const repostedIds = new Set(userReposts.map((r) => r.parentId));
    const bookmarkedIds = new Set(userBookmarks.map((b) => b.postId));

    const enriched = scored.map(({ _score, ...p }) => ({
        ...p,
        hasLiked: p.likes.some((l) => l.userId === userId),
        hasReposted: repostedIds.has(p.id),
        hasBookmarked: bookmarkedIds.has(p.id),
    }));

    return NextResponse.json({ posts: enriched }, { status: 200 });
}
