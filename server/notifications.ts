import "server-only";

import { prisma } from "@/server/prisma";
import type { Notification } from "@/types";

export async function fetchNotifications({
    userId,
}: {
    userId: string;
}) {
    const notifications = await prisma.notification.findMany({
        where: {
            userId,
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    username: true,
                    image: true,
                    verified: true,
                    role: true,
                },
            },
            actor: {
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
        orderBy: {
            createdAt: "desc",
        },
    });

    return notifications.map((notification) => ({
        id: notification.id,
        user: notification.user,
        actor: notification.actor,
        content: notification.content,
        read: notification.read,
        createdAt: notification.createdAt.toISOString(),
    })) satisfies Notification[];
}
