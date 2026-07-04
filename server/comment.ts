import { prisma } from "@/server/prisma"

export async function getComment(commentId: string) {
    const comment = await prisma.comment.findUnique(
        {
            where: {
                id: commentId,
                flagged: false,
                author: {
                    banned: false
                }
            },
            include: {
                post: true,
                author: true,
            }
        }
    )

    return comment
}

export async function getCommentByPostId(postId: string) {
    const comments = await prisma.comment.findMany(
        {
            where: {
                postId: postId,
                flagged: false,
                author: {
                    banned: false
                }
            },
            include: {
                post: true,
                author: true
            }
        }
    )

    return comments
}

export async function deleteComment(commentId: string) {
    const comment = await prisma.comment.delete({
        where: {
            id: commentId,
        },
    });

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

    return comments;
}