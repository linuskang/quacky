import "server-only";

import { prisma } from "@/server/prisma";

export async function fetchSearchUsers() {

    return prisma.user.findMany(
        {
            where: {
                banned: false,
            },
            select: {
                name: true,
                username: true,
                image: true,
                verified: true,
                role: true,
                bio: true,
            },
            orderBy: {
                createdAt: "desc",
            },
            take: 10,
        }
    );
}

export async function fetchSearchHashtags() {


    const hashtags = await prisma.postHashtag.groupBy(

        {
            by: ["tag"],
            where: {
                post: {
                    flagged: false,
                    author: {
                        banned: false,
                    },
                },
            },
            _count: {
                tag: true,
            },
            orderBy: {
                _count: {
                    tag: "desc",
                },
            },
            take: 10,
        }
    );

    return hashtags.map((hashtag) => (
        {
            tag: hashtag.tag,
            count: hashtag._count.tag,
        }
    ))
}
