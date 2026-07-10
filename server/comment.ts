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

export async function getComment(commentId: string) {
    const comment = await prisma.comment.findUnique({
        where: {
            id: commentId,
            author: {
                banned: false,
            },
        },
        include: {
            post: true,
            author: true,
        },
    })

    return comment
}

export async function getCommentByPostId(postId: string) {
    const comments = await prisma.comment.findMany({
        where: {
            postId: postId,
            flagged: false,
            author: {
                banned: false,
            },
        },
        include: {
            post: true,
            author: true,
        },
    })

    return comments
}

export async function deleteComment(commentId: string) {
    const comment = await prisma.comment.delete({
        where: {
            id: commentId,
        },
    })

    return comment
}

export async function getCommentsByPostId(postId: string) {
    const comments = prisma.comment.findMany({
        where: { postId, flagged: false },
        select: {
            id: true,
            postId: true,
            content: true,
            createdAt: true,
            updatedAt: true,
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
        },
        orderBy: { createdAt: "asc" },
    })

    return comments
}

export async function getCommentsByUserId(userId: string) {
    const comments = await prisma.comment.findMany({
        where: {
            authorId: userId,
            flagged: false,
            author: {
                banned: false,
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
                },
            },
            post: {
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
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    })

    return comments.map((comment) => ({
        id: comment.id,
        postId: comment.postId,
        content: comment.content,
        flagged: comment.flagged,
        createdAt: comment.createdAt.toISOString(),
        updatedAt: comment.updatedAt.toISOString(),
        author: comment.author,
        post: {
            id: comment.post.id,
            author: comment.post.author,
        },
    }))
}
