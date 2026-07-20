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

// Libraries
import { NextRequest, NextResponse } from "next/server"

// Server Utilities
import { prisma } from "@/server/prisma"
import { getSession } from "@/server/auth"
import { removeXP } from "@/server/users"
import { Up } from "@/server/upstream"
import {
    deleteComment,
    getCommentById,
    getCommentsByPostId
} from "@/server/comment"
import { getPost } from "@/server/posts"
import { Views } from "@/server/views"
import { xp } from "@/lib/var"

export async function GET(
    _req: NextRequest,
    { params }: {
        params: Promise<{ id: string }>
    }
) {
    const session = await getSession()

    if (!session) {
        return NextResponse.json(
            {
                code: 401,
                success: false,
                message: "Unauthorized",
            },
            { status: 401 }
        )
    }

    const { id } = await params

    const comment = await getCommentById(id)

    if (!comment) {
        return NextResponse.json(
            {
                code: 404,
                success: false,
                message: "404 comment not found"
            },
            { status: 404 }
        )
    }

    const post = await getPost(comment.postId, session)

    if (!post) {
        return NextResponse.json(
            {
                code: 404,
                success: false,
                message: "404 post not found"
            },
            { status: 404 }
        )
    }

    const comments = await getCommentsByPostId(post.id)
    const remainingComments = comments.filter(
        (c) => c.id !== comment.id // filter c =/= comment.id
    )

    const usersById = new Map(
        [
            post.author,
            comment.author,
            ...(post.repostOf ? [post.repostOf.author] : []),
            ...remainingComments.map((item) => item.author),
        ].map((user) => [
            user.id,
            {
                id: user.id,
                name: user.name,
                username: user.username,
                image: user.image,
                verified: user.verified,
                role: user.role,
            },
        ])
    )

    const [liked, commented, bookmarked, following, reposted] = await Promise.all([
        prisma.like.findFirst({
            where: {
                userId: session.user.id,
                postId: post.id,
            },
        }),
        prisma.comment.findFirst({
            where: {
                authorId: session.user.id,
                postId: post.id,
            },
        }),
        prisma.bookmark.findFirst({
            where: {
                userId: session.user.id,
                postId: post.id,
            },
        }),
        prisma.follow.findMany({
            where: {
                userId: session.user.id,
                followId: { in: [...usersById.keys()] },
            },
            select: { followId: true },
        }),
        await prisma.post.findFirst({
            where: {
                authorId: session.user.id,
                repostOfId: post.id,
            }
        })
    ])

    const followingIds = new Set(following.map((item) => item.followId)) // converts from { followId: string }[] to Set<string> i.e. {"id1", "id2", "id3"}
    const relevantUsers = [...usersById.values()].map((user) => ({
        ...user,
        following: followingIds.has(user.id),// adds following: boolean to each user obj
    }))

    await Views.add(post.id, session.user.id)

    return NextResponse.json({
        code: 200,
        success: true,
        data: {
            relevantUsers,
            comment: {
                id: comment.id,
                postId: comment.postId,
                content: comment.content,
                flagged: comment.flagged,
                createdAt: comment.createdAt,
                updatedAt: comment.updatedAt,
                post: {
                    id: post.id,
                    author: {
                        id: post.author.id,
                        name: post.author.name,
                        username: post.author.username,
                        image: post.author.image,
                        verified: post.author.verified,
                        role: post.author.role,
                    },
                    content: post.content,
                    repostOfId: post.repostOfId,
                    repostOf: post.repostOf ? {
                        id: post.repostOf.id,
                        author: {
                            id: post.repostOf.author.id,
                            name: post.repostOf.author.name,
                            username: post.repostOf.author.username,
                            image: post.repostOf.author.image,
                            verified: post.repostOf.author.verified,
                            role: post.repostOf.author.role,
                        },
                        content: post.repostOf.content,
                        flagged: post.repostOf.flagged,
                        edited: post.repostOf.edited,
                        createdAt: post.repostOf.createdAt,
                        updatedAt: post.repostOf.updatedAt,
                        views: post.repostOf.views,
                        attachments: post.repostOf.attachments,
                    } : null,
                    flagged: post.flagged,
                    edited: post.edited,
                    createdAt: post.createdAt,
                    updatedAt: post.updatedAt,
                    views: post.views,
                    likes: post._count.likes,
                    reposts: post._count.reposts,
                    comments: post._count.comments,
                    liked: Boolean(liked),
                    reposted: Boolean(reposted),
                    commented: Boolean(commented),
                    bookmarked: Boolean(bookmarked),
                    attachments: post.attachments,
                },
                comments: remainingComments,
                author: {
                    id: comment.author.id,
                    name: comment.author.name,
                    username: comment.author.username,
                    image: comment.author.image,
                    verified: comment.author.verified,
                    role: comment.author.role,
                },
            },
        },
    })
}

export async function DELETE(
    _req: NextRequest,
    { params }: {
        params: Promise<{ id: string }>
    }
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

    const comment = await getCommentById(id)

    if (!comment) {
        return NextResponse.json(
            {
                code: 404,
                success: false,
                message: "Comment not found",
            },
            { status: 404 }
        )
    }

    if (comment.authorId !== session.user.id && session.user.role !== "admin") {
        return NextResponse.json(
            {
                code: 403,
                success: false,
                message: "You do not have elevated permissions to perform this action",
            },
            { status: 403 }
        )
    }

    await deleteComment(id)
    await removeXP(session.user.username, xp.comment)

    // log for moderation purposes
    await Up.ingest({
        title: "Comment Deleted",
        icon: "🗑️",
        fields: [
            {
                name: "Post ID",
                value: comment.postId,
            },
            {
                name: "Deleted by",
                value: session.user.username,
            },
            {
                name: "Comment Author",
                value: comment.author.username,
            },
            {
                name: "Comment Content",
                value: comment.content,
            }
        ],
        data: {
            comment
        }
    })

    return NextResponse.json(
        {
            code: 200,
            success: true,
            message: "Deleted comment"
        },
        {
            status: 200,
        }
    )
}
