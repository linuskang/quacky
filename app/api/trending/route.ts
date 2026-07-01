import { prisma } from "@/server/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    const hashtags = await prisma.postHashtag.groupBy({
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
    });

    return NextResponse.json(
        hashtags.map((hashtag) => ({
            tag: hashtag.tag,
            count: hashtag._count.tag,
        }))
    );
}
