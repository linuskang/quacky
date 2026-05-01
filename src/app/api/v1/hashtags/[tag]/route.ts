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

// GET /api/v1/hashtags/[tag] — posts for a given hashtag
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ tag: string }> }
) {
    const session = await auth.api.getSession(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const tag = (await params).tag.toLowerCase();

    const hashtag = await prisma.hashtag.findUnique({
        where: { tag },
        select: { id: true, tag: true },
    });

    if (!hashtag) return NextResponse.json({ posts: [], tag }, { status: 200 });

    const postHashtags = await prisma.postHashtag.findMany({
        where: { hashtagId: hashtag.id },
        select: {
            post: {
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
                    pollVotes: { select: { userId: true, optionIndex: true } },
                    children: {
                        where: { isDeleted: false, isHidden: false },
                        select: { id: true, type: true },
                    },
                },
            },
        },
        orderBy: { post: { createdAt: "desc" } },
    });

    const posts = postHashtags
        .map((ph) => ph.post)
        .filter((p) => !p.isDeleted && !p.isHidden);

    const postIds = posts.map((p) => p.id);
    const userId = session.user.id;

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

    const enriched = posts.map((post) => ({
        ...post,
        replyCount: post.children.filter((c) => c.type === "reply").length,
        repostCount: post.children.filter((c) => c.type === "repost").length,
        hasLiked: post.likes.some((l) => l.userId === userId),
        hasReposted: repostedIds.has(post.id),
        hasBookmarked: bookmarkedIds.has(post.id),
    }));

    return NextResponse.json({ posts: enriched, tag }, { status: 200 });
}
