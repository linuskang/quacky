import { prisma } from "@/server/prisma";
import { getSession } from '@/server/auth';
import { NextRequest, NextResponse } from "next/server";
import type { Post } from "@/types";
import { sendMentionNotifications } from "@/server/mentions";
import { env } from "@/env";
import { extractHashtags } from "@/lib/hashtags";

// This is the main endpoint for fetching the most recent posts.
// Returns normal posts, reposts, and quoted posts.
// Ignores any banned users and flagged posts.
// Newest first

// Differientiators:

// Normal Post:
// repostOfId: null
// repostOf: null
// content: "hello world"

// Repost:
// repostOfId: "original-post-id"
// repostOf: { ...originalPost }
// content: ""

// Quote Repost:
// repostOfId: "original-post-id"
// repostOf: { ...originalPost }
// content: "my quote text"

import { fetchPosts } from "@/server/posts";

export async function GET(req: NextRequest) {
    const session = await getSession();

    if (!session) {
        return NextResponse.json(
            {
                err: "Unauthorized",
            },
            {
                status: 401,
            }
        )
    }

    const posts = await fetchPosts({
        userId: session.user.id,
        hashtag: req.nextUrl.searchParams.get("hashtag"),
    });

    return NextResponse.json(posts);
}

// These are the types we need for the request body of Posts.
// this endpoint sends a normal post.
// The client sends the following 2 pieces of data:
// 1. content
// 2. attachments (opt.)
// if you couldnt tell by the horrific code and types i wrote,
// i really hate typescript it takes so long to write because
// of the amount of strict types u need to write

export type PostBody = {
    content: string;
    attachments?: AttachmentBody[];
}

export type AttachmentBody = {
    name: string;
    url: string;
    type?: string | null;
}

export async function POST(req: NextRequest) {
    const session = await getSession();

    if (!session) {
        return NextResponse.json(
            {
                err: "Unauthorized",
            },
            {
                status: 401,
            }
        );
    }

    const body = await req.json() as PostBody;

    if (!body.content) {
        return NextResponse.json(
            {
                err: "Content is required",
            },
            {
                status: 400,
            }
        );
    }

    const content = body.content.trim();

    if (content.length === 0 || content.length > 400) {
        return NextResponse.json(
            {
                err: "Invalid content length",
            },
            {
                status: 400,
            }
        );
    }

    const attachments = body.attachments ?? [];
    const hashtags = extractHashtags(content);

    if (attachments.length > 2) {
        return NextResponse.json(
            {
                success: false,
                err: "You can only attach up to 2 files",
            },
            {
                status: 400,
            }
        )
    }

    const post = await prisma.post.create({
        data: {
            id: crypto.randomUUID(),
            authorId: session.user.id,
            content,
            postViews: {
                create: {
                    userId: session.user.id,
                },
            },
            attachments: {
                create: attachments
            },
            hashtags: {
                create: hashtags.map((tag) => ({
                    tag,
                })),
            }
        },
        select: {
            id: true,
            author: {
                select: {
                    id: true,
                    name: true,
                    username: true,
                    image: true,
                    verified: true,
                    role: true,
                },
            },
            content: true,
            flagged: true,
            edited: true,
            createdAt: true,
            updatedAt: true,
            views: true,
            attachments: true,
            _count: {
                select: {
                    likes: true,
                    comments: true,
                    reposts: true,
                },
            },
        },
    });

    await sendMentionNotifications(
        {
            content,
            actorId: session.user.id,
            actorUsername: session.user.username,
            message: `mentioned you in a [post](${env.BETTER_AUTH_URL}/post/${post.id})`,
        }
    );

    const newPost: Post = {
        id: post.id,
        author: {
            name: post.author.name,
            username: post.author.username,
            image: post.author.image,
            verified: post.author.verified,
        },
        content: post.content,
        repostOfId: null,
        repostOf: null,
        flagged: post.flagged,
        edited: post.edited,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
        views: post.views,
        likes: post._count.likes,
        comments: post._count.comments,
        reposts: post._count.reposts,
        attachments: post.attachments.map((attachment) => ({
            id: attachment.id,
            name: attachment.name,
            url: attachment.url,
            type: attachment.type,
            createdAt: attachment.createdAt.toISOString(),
        })),
    };

    return NextResponse.json(
        newPost,
        {
            status: 201
        }
    );
}
