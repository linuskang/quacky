import { prisma } from "@/server/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ handle: string }> }
) {
    const { handle } = await params;
    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get("search")?.toLowerCase() ?? "";

    const user = await prisma.user.findUnique({
        where: { username: handle },
        select: { id: true, private: true },
    });

    if (!user) {
        return NextResponse.json({ err: "User not found" }, { status: 404 });
    }

    if (user.private) {
        return NextResponse.json({ err: "This profile is private" }, { status: 403 });
    }

    const where = {
        userId: user.id,
        follow: {
            banned: false,
            ...(search
                ? {
                    OR: [
                        { name: { contains: search, mode: "insensitive" as const } },
                        { username: { contains: search, mode: "insensitive" as const } },
                    ],
                }
                : {}),
        },
    };

    const follows = await prisma.follow.findMany({
        where,
        select: {
            follow: {
                select: {
                    name: true,
                    username: true,
                    image: true,
                    verified: true,
                    role: true,
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    const users = follows.map((f) => f.follow);

    return NextResponse.json({ users });
}
