import { prisma } from "@/server/prisma";
import { auth } from '@/server/auth';
import { NextRequest, NextResponse } from "next/server";
import type { Post } from "@/types";

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

export async function GET(req: NextRequest) {
    const session = await auth.api.getSession({
        headers: req.headers,
    })

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

    const posts = await prisma.post.findMany({
        where: {
            flagged: false,
            author: {
                banned: false,
            },
            OR: [
                {
                    repostOfId: null,
                },
                {
                    repostOf: {
                        flagged: false,
                        author: {
                            banned: false,
                        },
                    },
                },
            ],
        },
        select: {
            id: true,

            author: {
                select: {
                    name: true,
                    username: true,
                    image: true,
                    verified: true,
                },
            },

            content: true,

            repostOfId: true,

            repostOf: {
                select: {
                    id: true,

                    author: {
                        select: {
                            name: true,
                            username: true,
                            image: true,
                            verified: true,
                        },
                    },

                    content: true,
                    flagged: true,
                    edited: true,
                    createdAt: true,
                    updatedAt: true,
                    views: true,

                    attachments: {
                        select: {
                            name: true,
                            url: true,
                            type: true,
                        },
                    },
                },
            },

            flagged: true,
            edited: true,
            createdAt: true,
            updatedAt: true,
            views: true,

            _count: {
                select: {
                    likes: true,
                    reposts: true,
                    comments: {
                        where: {
                            flagged: false,
                        }
                    },
                },
            },

            likes: {
                where: {
                    userId: session.user.id,
                },
                select: {
                    userId: true,
                },
            },

            reposts: {
                where: {
                    authorId: session.user.id,
                },
                select: {
                    id: true,
                },
            },

            comments: {
                where: {
                    authorId: session.user.id,
                },
                select: {
                    id: true,
                },
            },

            bookmarks: {
                where: {
                    userId: session.user.id,
                },
                select: {
                    userId: true,
                },
            },

            attachments: {
                select: {
                    name: true,
                    url: true,
                    type: true,
                },
            },
        },

        orderBy: {
            createdAt: "desc",
        },
    });

    const res = posts.map((post) => ({
        id: post.id,
        author: post.author,
        content: post.content,

        repostOfId: post.repostOfId,
        repostOf: post.repostOf
            ? {
                id: post.repostOf.id,
                author: post.repostOf.author,
                content: post.repostOf.content,
                flagged: post.repostOf.flagged,
                edited: post.repostOf.edited,
                createdAt: post.repostOf.createdAt.toISOString(),
                updatedAt: post.repostOf.updatedAt.toISOString(),
                views: post.repostOf.views,
                attachments: post.repostOf.attachments.map((attachment) => ({
                    name: attachment.name,
                    url: attachment.url,
                    type: attachment.type,
                })),
            }
            : null,

        flagged: post.flagged,
        edited: post.edited,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
        views: post.views,

        likes: post._count.likes,
        reposts: post._count.reposts,
        comments: post._count.comments,

        liked: post.likes.length > 0,
        reposted: post.reposts.length > 0,
        commented: post.comments.length > 0,
        bookmarked: post.bookmarks.length > 0,

        attachments: post.attachments.map((attachment) => ({
            name: attachment.name,
            url: attachment.url,
            type: attachment.type,
        })),
    })) as Post[];

    return NextResponse.json(res);
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
    const session = await auth.api.getSession({
        headers: req.headers,
    });

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
