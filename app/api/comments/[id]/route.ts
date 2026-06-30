import { prisma } from "@/server/prisma";
import { auth } from '@/server/auth';
import { NextRequest, NextResponse } from "next/server";
import type { Comment, Post, User } from "@/types";
import { NotificationService } from "@/server/helpers";

type PrismaUser = Omit<User, "role"> & {
    role: string | null;
};

type CommentPageResponse = {
    comment: Comment;
    post: Post;
};

function serializeUser(user: PrismaUser): User {
    return {
        ...user,
        role: user.role ?? undefined,
    };
}

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

    const comment = await prisma.comment.findFirst(
        {
            where: {
                id,
                author: {
                    banned: false,
                },
                post: {
                    author: {
                        banned: false,
                    },
                },
            },
            select: {
                id: true,
                postId: true,
                content: true,
                flagged: true,
                createdAt: true,
                updatedAt: true,
                author: {
                    select: {
                        name: true,
                        username: true,
                        image: true,
                        verified: true,
                        role: true,
                    }
                },
            },
        }
    )

    if (!comment) {
        return NextResponse.json(
            {
                err: "Comment not found",
            },
            {
                status: 404,
            }
        )
    }

    const post = await prisma.post.findFirst({
        where: {
            id: comment.postId,
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

    const postComments = await prisma.comment.findMany({
        where: {
            postId: post.id,
            flagged: false,
        },
        select: {
            id: true,
            postId: true,
            content: true,
            flagged: true,
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
        orderBy: {
            createdAt: "asc",
        },
    });

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

    const res: CommentPageResponse = {
        comment: {
            id: comment.id,
            postId: comment.postId,
            author: serializeUser(comment.author),
            content: comment.content,
            flagged: comment.flagged,
            createdAt: comment.createdAt.toISOString(),
            updatedAt: comment.updatedAt.toISOString(),
        },
        post: {
            id: post.id,
            author: serializeUser(post.author),
            content: post.content,
            repostOfId: post.repostOfId,
            repostOf: post.repostOf
                ? {
                    id: post.repostOf.id,
                    author: serializeUser(post.repostOf.author),
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
            postComments: postComments.map((postComment) => ({
                id: postComment.id,
                postId: postComment.postId,
                author: serializeUser(postComment.author),
                content: postComment.content,
                flagged: postComment.flagged,
                createdAt: postComment.createdAt.toISOString(),
                updatedAt: postComment.updatedAt.toISOString(),
            })),
        },
    };

    return NextResponse.json(res)
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

    const comment = await prisma.comment.findUnique({
        where: {
            id,
        },
        select: {
            id: true,
            authorId: true,
            postId: true,
            post: {
                select: {
                    authorId: true,
                },
            },
        },
    });

    if (!comment) {
        return NextResponse.json(
            {
                err: "Comment not found",
            },
            {
                status: 404,
            }
        )
    }

    if (comment.authorId !== session.user.id && session.user.role !== "admin") {
        return NextResponse.json(
            {
                err: "You are not the author of this comment",
            },
            {
                status: 403,
            }
        )
    }

    await prisma.comment.delete({
        where: {
            id,
        },
    });

    await NotificationService.removeEngagement(
        "comment",
        comment.post.authorId,
        comment.authorId,
        comment.postId,
    );

    return NextResponse.json(
        {
            success: true,
            postId: comment.postId,
        },
        {
            status: 200,
        }
    )
}
