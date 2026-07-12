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

import { prisma } from "@/server/prisma"
import { getSession } from "@/server/auth"
import { NextRequest, NextResponse } from "next/server"
import type { Post } from "@/types"
import { NotificationService } from "@/server/helpers"
import { getCommentsByPostId } from "@/server/comment"
import { getPost } from "@/server/posts"
import type { Attachment } from "@/types"
import { removeXP } from "@/server/users"
import { xp } from "@/lib/var"

function withFollowing<T extends { id?: string }>(
    user: T,
    followingIds: Set<string>
) {
    return {
        ...user,
        following: user.id ? followingIds.has(user.id) : false,
    }
}

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getSession()

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

    const { id } = await params

    const post = await getPost(id, session)

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

    const postView = await prisma.postView.createMany({
        data: [
            {
                userId: session.user.id,
                postId: post.id,
            },
        ],
        skipDuplicates: true,
    })

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
        })
    }

    const comments = await getCommentsByPostId(post.id)

    const relevantUserIds = Array.from(
        new Set(
            [
                post.author.id,
                ...comments.map((comment) => comment.author.id),
            ].filter(Boolean)
        )
    )
    const following = await prisma.follow.findMany({
        where: {
            userId: session.user.id,
            followId: {
                in: relevantUserIds,
            },
        },
        select: {
            followId: true,
        },
    })
    const followingIds = new Set(following.map((follow) => follow.followId))

    const res = {
        id: post.id,
        author: withFollowing(post.author, followingIds),
        content: post.content,

        repostOfId: post.repostOfId,
        repostOf: post.repostOf
            ? {
                id: post.repostOf.id,
                author: withFollowing(post.repostOf.author, followingIds),
                content: post.repostOf.content,
                flagged: post.repostOf.flagged,
                edited: post.repostOf.edited,
                createdAt: post.repostOf.createdAt.toISOString(),
                updatedAt: post.repostOf.updatedAt.toISOString(),
                views: post.repostOf.views,
                attachments: post.repostOf.attachments.map(
                    (attachment: Attachment) => ({
                        name: attachment.name,
                        url: attachment.url,
                        type: attachment.type,
                    })
                ),
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
            author: withFollowing(c.author, followingIds),
            content: c.content,
            createdAt: c.createdAt.toISOString(),
            updatedAt: c.updatedAt.toISOString(),
        })),
    } as Post

    return NextResponse.json(res)
}

export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getSession()

    if (!session) {
        return NextResponse.json("Unauthorized", {
            status: 401,
        })
    }

    const { id } = await params

    const post = await prisma.post.findUnique({
        where: {
            id,
        },
        include: {
            repostOf: {
                select: {
                    id: true,
                    authorId: true,
                },
            },
        },
    })

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

    if (post.flagged && session.user.role !== "admin") {
        return NextResponse.json(
            {
                err: "Post is flagged",
            },
            {
                status: 403,
            }
        )
    }

    const res = await prisma.post.delete({
        where: {
            id,
        },
    })

    if (post.repostOf) {
        await NotificationService.removeEngagement(
            post.content ? "quote" : "repost",
            post.repostOf.authorId,
            post.authorId,
            post.repostOf.id
        )
    }

    await NotificationService.removeEngagementsForPost(post.id)

    await removeXP(session.user.username, xp.post)

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
    const session = await getSession()

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

    const { id } = await params

    const post = await prisma.post.findUnique({
        where: {
            id,
        },
    })

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

    const body = (await req.json()) as {
        content: string
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

    const content = body.content.trim()

    const res = await prisma.post.update({
        where: {
            id,
        },
        data: {
            content,
            edited: true,
        },
    })

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
