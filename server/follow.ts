import { prisma } from "@/server/prisma";
import { NotificationService } from "./helpers";

export async function follow(followerId: string, followeeId: string) {
    if (followerId === followeeId) {
        throw new Error("You cannot follow yourself");
    }

    // we use createMany here so i can use the built in counter to see if the user actually followed and is new,
    // to send notifications. basically the less jank way of doing it with minimal code.
    const follow = await prisma.follow.createMany({
        data: [
            {
                userId: followerId,
                followId: followeeId,
            },
        ],
        skipDuplicates: true,
    });

    // check if the user already follows the user, if not, send a notification
    if (follow.count === 1) {
        await NotificationService.sendFollow(followeeId, followerId);
    }

    // success
    return true;
}

export async function unfollow(followerId: string, followeeId: string) {
    // check if anyone is trying anything ehehehehehehehe
    if (followerId === followeeId) {
        throw new Error("You cannot unfollow yourself");
    }

    // same thing here but deleteMany from above.
    const res = await prisma.follow.deleteMany({
        where: {
            userId: followerId,
            followId: followeeId,
        },
    });

    // check if user was following the user, if so remove that notification sent to the receiving usr.
    if (res.count === 1) {
        await NotificationService.removeFollow(followeeId, followerId);
    }

    return true;
}