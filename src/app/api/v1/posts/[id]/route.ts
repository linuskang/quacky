// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db";
import { auth } from "@/server/auth";
import { syncHashtagsForPost } from "@/lib/hashtags";
import Discord from "@/server/utilities/discord";

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
    poll: true,
    viewCount: true,
    pinned: true,
    readOnly: true,
    isHidden: true,
    isDeleted: true,
    createdAt: true,
    editedAt: true,
    parentId: true,
    likes: { select: { userId: true } },
    pollVotes: { select: { userId: true, optionIndex: true } },
    children: {
        where: { isDeleted: false, isHidden: false },
        select: { id: true, type: true, authorId: true },
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
            poll: true,
            viewCount: true,
            createdAt: true,
            editedAt: true,
            isDeleted: true,
            isHidden: true,
        },
    },
};

function enrichPost(post: any, userId: string) {
    const replyCount = post.children?.filter((c: any) => c.type === "reply").length ?? 0;
    const repostCount = post.children?.filter((c: any) => c.type === "repost").length ?? 0;
    const hasLiked = post.likes?.some((l: any) => l.userId === userId) ?? false;
    const hasReplied = post.children?.some((c: any) => c.type === "reply" && c.authorId === userId) ?? false;

    const poll = post.poll as { options: string[] } | null;
    const pollVotes: { userId: string; optionIndex: number }[] = post.pollVotes ?? [];
    const pollVoteCounts = poll
        ? poll.options.map((_: string, i: number) => pollVotes.filter((v) => v.optionIndex === i).length)
        : undefined;
    const userVoteRecord = pollVotes.find((v) => v.userId === userId);
    const userVote = userVoteRecord ? userVoteRecord.optionIndex : null;

    return {
        ...post,
        replyCount,
        repostCount,
        hasLiked,
        hasReplied,
        pollVoteCounts,
        userVote,
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
                    poll: true,
                    viewCount: true,
                    pinned: true,
                    readOnly: true,
                    isHidden: true,
                    isDeleted: true,
                    createdAt: true,
                    editedAt: true,
                    parentId: true,
                    likes: { select: { userId: true } },
                    pollVotes: { select: { userId: true, optionIndex: true } },
                    _count: { select: { children: true } },
                },
                orderBy: { createdAt: "asc" },
            },
        },
    });

    if (!post) {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Record unique view — use try/catch to handle concurrent duplicate requests gracefully
    try {
        await prisma.$transaction([
            prisma.postView.create({ data: { postId: id, userId } }),
            prisma.post.update({ where: { id }, data: { viewCount: { increment: 1 } } }),
        ]);
    } catch (e: any) {
        // P2002 = unique constraint violation (view already exists) — safe to ignore
        if (e?.code !== "P2002") throw e;
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
    const enrichedReplies = (post.children as any[]).map((reply) => {
        const replyPoll = reply.poll as { options: string[] } | null;
        const replyPollVotes: { userId: string; optionIndex: number }[] = reply.pollVotes ?? [];
        const replyPollVoteCounts = replyPoll
            ? replyPoll.options.map((_: string, i: number) => replyPollVotes.filter((v) => v.optionIndex === i).length)
            : undefined;
        const replyUserVoteRecord = replyPollVotes.find((v) => v.userId === userId);
        return {
            ...reply,
            replyCount: reply._count?.children ?? 0,
            repostCount: 0,
            hasLiked: reply.likes?.some((l: any) => l.userId === userId) ?? false,
            pollVoteCounts: replyPollVoteCounts,
            userVote: replyUserVoteRecord ? replyUserVoteRecord.optionIndex : null,
        };
    });

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

    return NextResponse.json(
        { post: enrichedPost, ancestors },
        {
            status: 200,
            headers: {
                "Cache-Control": "no-store, max-age=0",
            },
        }
    );
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth.api.getSession(request);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const content = typeof body.content === "string" ? body.content.trim() : null;

    if (content === null) {
        return NextResponse.json({ error: "Invalid content" }, { status: 400 });
    }

    const existing = await prisma.post.findUnique({
        where: { id },
        select: {
            authorId: true,
            type: true,
            isDeleted: true,
            attachments: true,
            poll: true,
        },
    });

    if (!existing || existing.isDeleted) {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const isAuthor = existing.authorId === session.user.id;
    const isAdmin = session.user.role === "Admin";
    if (!isAuthor && !isAdmin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (existing.type === "repost") {
        return NextResponse.json({ error: "Reposts cannot be edited" }, { status: 400 });
    }

    if (content.length > 400) {
        return NextResponse.json({ error: "Invalid content" }, { status: 400 });
    }

    if (!content && !existing.attachments && !existing.poll) {
        return NextResponse.json({ error: "Invalid content" }, { status: 400 });
    }

    const updatedPost = await prisma.post.update({
        where: { id },
        data: {
            content,
            editedAt: new Date(),
        },
        select: { id: true, editedAt: true },
    });

    await syncHashtagsForPost(prisma, id, content);

    void new Discord().send({
        embeds: [{
            title: "Post Edited",
            description: content ? (content.length > 100 ? content.slice(0, 100) + "…" : content) : undefined,
            color: 0xFEE75C,
            author: { name: `${session.user.name} (@${(session.user as any).handle})`, icon_url: session.user.image ?? undefined },
            fields: [{ name: "Post ID", value: id, inline: true }],
            timestamp: new Date().toISOString(),
        }],
    });

    return NextResponse.json({ success: true, post: updatedPost }, { status: 200 });
}
