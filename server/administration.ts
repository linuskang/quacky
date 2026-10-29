//   ______                                 __
//  /      \                               /  |
// /$$$$$$  | __    __   ______    _______ $$ |   __  __    __
// $$ |  $$ |/  |  /  | /      \  /       |$$ |  /  |/  |  /  |
// $$ |  $$ |$$ |  $$ | $$$$$$  |/$$$$$$$/ $$ |_/$$/ $$ |  $$ |
// $$ |_ $$ |$$ |  $$ | /    $$ |$$ |      $$   $$<  $$ |  $$ |
// $$ / \$$ |$$ \\__$$ |/$$$$$$$ |$$ \\_____ $$$$$$  \ $$ \\__$$ |
// $$ $$ $$< $$    $$/ $$    $$ |$$       |$$ | $$  |$$    $$ |
//  $$$$$$  | $$$$$$/   $$$$$$$/  $$$$$$$/ $$/   $$/  $$$$$$$ |
//      $$$/                                         /  \__$$ |
//                                                   $$    $$/
//                                                    $$$$$$/
//
// Linus Kang, 2026
// Work is licensed under the CC BY-NC 4.0 license.

import { prisma } from "@/server/prisma"
import { broadcastPushNotification } from "@/server/notification"

export class Admin {
    static async banUser(userId: string, banReason: string) {
        await prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                banned: true,
                banReason: banReason,
            },
        })

        await prisma.session.deleteMany({
            where: {
                userId: userId,
            },
        })

        return true
    }

    static async unbanUser(userId: string) {
        await prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                banned: false,
                banReason: null,
                banExpires: null,
            },
        })

        return true
    }

    static async flagPost(postId: string) {
        await prisma.post.update({
            where: {
                id: postId,
            },
            data: {
                flagged: true,
            },
        })

        return true
    }

    static async unflagPost(postId: string) {
        await prisma.post.update({
            where: {
                id: postId,
            },
            data: {
                flagged: false,
            },
        })

        return true
    }

    static async flagComment(commentId: string) {
        await prisma.comment.update({
            where: {
                id: commentId,
            },
            data: {
                flagged: true,
            },
        })
        return true
    }

    static async unflagComment(commentId: string) {
        await prisma.comment.update({
            where: {
                id: commentId,
            },
            data: {
                flagged: false,
            },
        })
        return true
    }

    static async broadcastNotification({
        userId = "quacky",
        content,
    }: {
        userId?: string
        content: string
    }) {
        const actor = await prisma.user.findUnique({
            where: {
                id: userId,
            },
            select: {
                id: true,
                name: true,
            },
        })

        if (!actor) {
            throw new Error(`User with ID "${userId}" not found`)
        }

        const users = await prisma.user.findMany({
            select: {
                id: true,
            },
        })

        if (users.length === 0) {
            return { count: 0 }
        }

        await prisma.notification.createMany({
            data: users.map((user) => ({
                userId: user.id,
                actorId: actor.id,
                content,
            })),
        })

        const plainContent = content.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
        void broadcastPushNotification({
            title: `${actor.name} from Quacky`,
            body: plainContent,
            url: "/notifications",
        })

        return { count: users.length }
    }
}
