import { prisma } from "@/server/prisma"

export class Views {
    static async add(postId: string, userId: string) {
        const view = await prisma.postView.createMany({
            data: [
                {
                    userId,
                    postId,
                },
            ],
            skipDuplicates: true,
        })

        if (view.count === 1) {
            await prisma.post.update({
                where: {
                    id: postId,
                },
                data: {
                    views: {
                        increment: 1,
                    },
                },
            })

            return true
        } else {
            return false
        }
    }
}