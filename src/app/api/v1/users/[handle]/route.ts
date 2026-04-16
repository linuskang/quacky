// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db";
import { auth } from "@/server/auth";

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ handle: string }> }
) {
    const session = await auth.api.getSession(request);
    const params = await context.params;

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findFirst({
        where: { handle: params.handle },
        select: {
            id: true,
            name: true,
            handle: true,
            bio: true,
            image: true,
            verified: true,
            privateAccount: true,
            createdAt: true,
            followers: { select: { follower: { select: { handle: true } } } },
            following: { select: { following: { select: { handle: true } } } },
            banned: true,
            role: true,
        },
    });

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const authorSelect = {
        id: true,
        name: true,
        handle: true,
        image: true,
        verified: true,
    };

    const posts = await prisma.post.findMany({
        where: {
            authorId: user.id,
            // Profile shows the user's original posts, reposts, and quotes — not raw replies
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
            likes: { select: { userId: true } },
            children: {
                where: { isDeleted: false, isHidden: false },
                select: { id: true, type: true },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    const userId = session.user.id;
    const postIds = posts.map((p) => p.id);

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

    if (user.banned) {
        return NextResponse.json(
            {
                user: {
                    banned: user.banned,
                    name: user.name,
                    handle: user.handle,
                    createdAt: user.createdAt,
                },
                posts: [],
            },
            { status: 200 }
        );
    }

    if (user.privateAccount) {
        return NextResponse.json(
            {
                user: {
                    id: user.id,
                    name: user.name,
                    handle: user.handle,
                    image: user.image,
                    verified: user.verified,
                    privateAccount: user.privateAccount,
                    createdAt: user.createdAt,
                    followers: user.followers.length,
                    following: user.following.length,
                    banned: user.banned,
                    role: user.role,
                    posts: posts.length,
                },
                posts: [],
            },
            { status: 200 }
        );
    }

    return NextResponse.json(
        {
            user: {
                id: user.id,
                name: user.name,
                handle: user.handle,
                bio: user.bio,
                image: user.image,
                verified: user.verified,
                privateAccount: user.privateAccount,
                createdAt: user.createdAt,
                followers: user.followers.length,
                following: user.following.length,
                banned: user.banned,
                role: user.role,
                posts: posts.length,
            },
            posts: enriched,
        },
        { status: 200 }
    );
}
