import { prisma } from "@/server/prisma";

export class NotificationService {
    static async send(
        userId: string,
        actorId: string,
        content: string,
    ) {
        const res = await prisma.notification.create(
            {
                data: {
                    userId,
                    actorId,
                    content
                }
            }
        )
        return res;
    }
}