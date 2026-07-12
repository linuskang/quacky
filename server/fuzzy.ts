import { prisma } from "@/server/prisma"

export class Fuzzy {
    static async markAllAsRead(userId: string) {
        await prisma.fuzzy.updateMany({
            where: {
                receiverId: userId,
                read: false
            },
            data: {
                read: true
            }
        })
    }

    static async getUnreadCount(userId: string) {
        const count = await prisma.fuzzy.count({
            where: {
                receiverId: userId,
                read: false
            }
        })
        return count
    }
}