import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db";
import { auth } from "@/server/auth";

export async function GET(request: NextRequest) {
    const session = await auth.api.getSession(request);

    if (!session) {
        return NextResponse.json(
            { success: false, error: "Unauthorized" },
            { status: 401 }
        );
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim() ?? "";

    if (!query) {
        return NextResponse.json(
            {
                success: true,
                users: [],
            },
            { status: 200 }
        );
    }

    try {
        const users = await prisma.user.findMany({
            where: {
                id: {
                    not: session.user.id,
                },
                banned: false,
                OR: [
                    {
                        name: {
                            contains: query,
                            mode: "insensitive",
                        },
                    },
                    {
                        handle: {
                            contains: query,
                            mode: "insensitive",
                        },
                    },
                ],
            },
            select: {
                id: true,
                name: true,
                handle: true,
                image: true,
                verified: true,
                bio: true,
            },
            take: 8,
            orderBy: [
                {
                    verified: "desc",
                },
                {
                    name: "asc",
                },
            ],
        });

        return NextResponse.json(
            {
                success: true,
                users,
            },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
