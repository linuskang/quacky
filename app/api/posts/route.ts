//   ______                                 __
//  /      \                               /  |
// /$$$$$$  | __    __   ______    _______ $$ |   __  __    __
// $$ |  $$ |/  |  /  | /      \  /       |$$ |  /  |/  |  /  |
// $$ |  $$ |$$ |  $$ | $$$$$$  |/$$$$$$$/ $$ |_/$$/ $$ |  $$ |
// $$ |_ $$ |$$ |  $$ | /    $$ |$$ |      $$   $$<  $$ |  $$ |
// $$ / \$$ |$$ \__$$ |/$$$$$$$ |$$ \_____ $$$$$$  \ $$ \__$$ |
// $$ $$ $$< $$    $$/ $$    $$ |$$       |$$ | $$  |$$    $$ |
//  $$$$$$  | $$$$$$/   $$$$$$$/  $$$$$$$/ $$/   $$/  $$$$$$$ |
//      $$$/                                         /  \__$$ |
//                                                   $$    $$/
//                                                    $$$$$$/
//
// Linus Kang, 2026
// Work is licensed under the CC BY-NC 4.0 license.

import { prisma } from "@/server/prisma";
import { getSession } from '@/server/auth';
import { NextRequest, NextResponse } from "next/server";
import { sendMentionNotifications } from "@/server/mentions";
import { env } from "@/env";
import { extractHashtags } from "@/lib/hashtags";
import { addXP } from "@/server/users";
import { xp } from "@/lib/var";

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
            "Unauthorized",
            {
                status: 401,
            }
        );
    }

    if (!session.user.unlockedPosting) {
        return new NextResponse(
            "Posting is locked for your account. Please complete the quiz at /quiz/post to unlock posting!",
            { status: 403 }
        )
    }

    const body = await req.json() as PostBody;


    const content = body.content.trim();
    if (!content || content.length === 0 || content.length > 400) {
        return NextResponse.json(
            "Invalid content",
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

    await addXP(
        session.user.username,
        xp.post
    );

    return NextResponse.json(
        {
            success: true
        },
        {
            status: 201
        }
    );
}
