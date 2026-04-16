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

// GET — fetch current user's bookmarked posts
export async function GET(request: NextRequest) {
    const session = await auth.api.getSession(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = session.user.id;

    const bookmarks = await prisma.bookmark.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        select: {
            post: {
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
            },
        },
    });

    // Filter out deleted posts and enrich
    const posts = bookmarks
        .map((b) => b.post)
        .filter((p) => !p.isDeleted)
        .map((post) => ({
            ...post,
            replyCount: post.children.filter((c) => c.type === "reply").length,
            repostCount: post.children.filter((c) => c.type === "repost").length,
            hasLiked: post.likes.some((l) => l.userId === userId),
            hasBookmarked: true,
        }));

    return NextResponse.json({ posts }, { status: 200 });
}
