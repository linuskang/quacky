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

export class Admin {
    static async banUser(userId: string, banReason: string) {
        await prisma.user.update(
            {
                where: {
                    id: userId
                },
                data: {
                    banned: true,
                    banReason: banReason
                }
            }
        );

        await prisma.session.deleteMany(
            {
                where: {
                    userId: userId
                }
            }
        )

        return true;
    }

    static async unbanUser(userId: string) {
        await prisma.user.update(
            {
                where: {
                    id: userId
                },
                data: {
                    banned: false,
                    banReason: null,
                    banExpires: null
                }
            }
        );

        return true
    }

    static async flagPost(postId: string) {
        await prisma.post.update(
            {
                where: {
                    id: postId
                },
                data: {
                    flagged: true
                }
            }
        );

        return true
    }

    static async unflagPost(postId: string) {
        await prisma.post.update(
            {
                where: {
                    id: postId
                },
                data: {
                    flagged: false
                }
            }
        );

        return true
    }

    static async flagComment(commentId: string) {
        await prisma.comment.update(
            {
                where: {
                    id: commentId
                },
                data: {
                    flagged: true
                }
            }
        );
        return true
    }

    static async unflagComment(commentId: string) {
        await prisma.comment.update(
            {
                where: {
                    id: commentId
                },
                data: {
                    flagged: false
                }
            }
        );
        return true
    }
}