import { prisma } from "@/server/prisma";
import { auth } from '@/server/auth';
import { NextRequest, NextResponse } from "next/server";
import type { Post } from "@/types";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    const post = await prisma.post.findFirst(
        {
            where: {
                id,
                author: {
                    banned: false,
                },
                OR: [
                    {
                        repostOfId: null,
                    },
                    {
                        repostOf: {
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
                        role: true,
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
                                role: true,
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
        }
    );

    if (!post) {
        return NextResponse.json(
            {
                err: "Post not found",
            },
            {
                status: 404,
            }
        );
    }

    const postView = await prisma.postView.createMany({
        data: [
            {
                userId: session.user.id,
                postId: post.id,
            },
        ],
        skipDuplicates: true,
    });

    if (postView.count === 1) {
        await prisma.post.update({
            where: {
                id: post.id,
            },
            data: {
                views: {
                    increment: 1,
                },
            },
        });
    }

    const comments = await prisma.comment.findMany({
        where: { postId: id, flagged: false },
        select: {
            id: true,
            postId: true,
            content: true,
            createdAt: true,
            updatedAt: true,
            author: {
                select: {
                    name: true,
                    username: true,
                    image: true,
                    verified: true,
                    role: true,
                },
            },
        },
        orderBy: { createdAt: "asc" },
    });

    const res = {
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
        views: post.views + postView.count,

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
        postComments: comments.map((c) => ({
            id: c.id,
            postId: c.postId,
            author: c.author,
            content: c.content,
            createdAt: c.createdAt.toISOString(),
            updatedAt: c.updatedAt.toISOString(),
        })),
    } as Post;

    return NextResponse.json(
        res
    );
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    const post = await prisma.post.findUnique({
        where: {
            id,
        },
    });

    if (!post) {
        return NextResponse.json(
            {
                err: "Post not found",
            },
            {
                status: 404,
            }
        )
    }

    if (post.authorId !== session.user.id && session.user.role !== "admin") {
        return NextResponse.json(
            {
                err: "You are not the author of this post",
            },
            {
                status: 403,
            }
        )
    }

    const res = await prisma.post.delete(
        {
            where: {
                id,
            },
        }
    );

    return NextResponse.json(
        {
            success: true,
            res,
        },
        {
            status: 200,
        }
    )
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    const post = await prisma.post.findUnique(
        {
            where: {
                id,
            },
        }
    );

    if (!post) {
        return NextResponse.json(
            {
                err: "Post not found",
            },
            {
                status: 404,
            }
        )
    }

    if (post.authorId !== session.user.id) {
        return NextResponse.json(
            {
                err: "You are not the author of this post",
            },
            {
                status: 403,
            }
        )
    }

    if (post.flagged) {
        return NextResponse.json(
            {
                err: "Post is flagged",
            },
            {
                status: 403,
            }
        )
    }

    const body = await req.json() as {
        content: string;
    }

    if (!body.content) {
        return NextResponse.json(
            {
                err: "Content is required",
            },
            {
                status: 400,
            }
        )
    }

    const content = body.content.trim();

    const res = await prisma.post.update(
        {
            where: {
                id,
            },
            data: {
                content,
                edited: true,
            },
        }
    );

    return NextResponse.json(
        {
            success: true,
            res,
        },
        {
            status: 200,
        }
    )
}
