import "server-only";

import { prisma } from "@/server/prisma";

export async function getUser(handle: string) {

    const user = await prisma.user.findUnique(
        {
            where: {
                username: handle,
            },
            include: {
                following: {
                    select: {
                        follow: {
                            select: {
                                username: true,
                            },
                        },
                    },
                },
                followers: {
                    select: {
                        user: {
                            select: {
                                username: true,
                            },
                        },
                    },
                },
            },
        }
    )

    if (!user) {
        return null;
    }

    const following = user.following.map(({ follow }) => follow.username);
    const followers = user.followers.map(({ user }) => user.username);

    return {
        ...user,
        following,
        followers,
    }
}