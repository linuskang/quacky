"use server";

import { getSession } from "@/server/auth";
import { follow, unfollow } from "@/server/follow";
import { prisma } from "@/server/prisma";

export async function setFollowing(username: string, nextFollowing: boolean) {
    const session = await getSession();

    if (!session) {
        throw new Error("Unauthorized");
    }

    const user = await prisma.user.findUnique({
        where: { username },
        select: { id: true },
    });

    if (!user) {
        throw new Error("User not found");
    }

    if (nextFollowing) {
        await follow(session.user.id, user.id);
    } else {
        await unfollow(session.user.id, user.id);
    }

    return { following: nextFollowing };
}
