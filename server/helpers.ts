import { prisma } from "@/server/prisma";
import { env } from "@/env";

type EngagementNotificationType = "like" | "repost" | "quote" | "comment";

const engagementCopy: Record<EngagementNotificationType, string> = {
    like: "liked your",
    repost: "reposted your",
    quote: "quoted your",
    comment: "commented on your",
};

function engagementContent(type: EngagementNotificationType, postId: string) {
    return `${engagementCopy[type]} [post](${env.BETTER_AUTH_URL}/post/${postId})`;
}

function followContent() {
    return "started following you";
}

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

    static async sendEngagement(
        type: EngagementNotificationType,
        userId: string,
        actorId: string,
        postId: string,
    ) {
        if (userId === actorId) return null;

        return NotificationService.send(
            userId,
            actorId,
            engagementContent(type, postId),
        );
    }

    static async removeEngagement(
        type: EngagementNotificationType,
        userId: string,
        actorId: string,
        postId: string,
    ) {
        await prisma.notification.deleteMany({
            where: {
                userId,
                actorId,
                content: engagementContent(type, postId),
            },
        });
    }

    static async removeEngagementsForPost(postId: string) {
        await prisma.notification.deleteMany({
            where: {
                content: {
                    in: Object.keys(engagementCopy).map((type) =>
                        engagementContent(type as EngagementNotificationType, postId)
                    ),
                },
            },
        });
    }

    static async sendFollow(
        userId: string,
        actorId: string,
    ) {
        if (userId === actorId) return null;

        return NotificationService.send(
            userId,
            actorId,
            followContent(),
        );
    }

    static async removeFollow(
        userId: string,
        actorId: string,
    ) {
        await prisma.notification.deleteMany({
            where: {
                userId,
                actorId,
                content: followContent(),
            },
        });
    }
}
