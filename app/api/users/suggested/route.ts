import { getSession } from "@/server/auth";
import { prisma } from "@/server/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await getSession();

    if (!session) {
        return NextResponse.json({ err: "Unauthorized" }, { status: 401 });
    }

    const users = await prisma.user.findMany({
        where: {
            id: {
                not: session.user.id,
            },
            banned: false,
            followers: {
                none: {
                    userId: session.user.id,
                },
            },
        },
        orderBy: [
            {
                followers: {
                    _count: "desc",
                },
            },
            {
                xp: "desc",
            },
            {
                createdAt: "desc",
            },
        ],
        take: 3,
        select: {
            id: true,
            name: true,
            username: true,
            image: true,
            verified: true,
            role: true,
            bio: true,
            _count: {
                select: {
                    followers: true,
                },
            },
        },
    });

    return NextResponse.json(
        users.map((user) => ({
            id: user.id,
            name: user.name,
            username: user.username,
            image: user.image,
            verified: user.verified,
            role: user.role,
            bio: user.bio,
            followers: user._count.followers,
        }))
    );
}
