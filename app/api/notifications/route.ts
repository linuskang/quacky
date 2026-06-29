import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { prisma } from "@/server/prisma";

export async function GET(req: NextRequest) {
    const session = await auth.api.getSession({
        headers: req.headers,
    });

    if (!session) {
        return NextResponse.json(
            {
                err: "Unauthorized",
            },
            {
                status: 401,
            }
        );
    }

    const notifications = await prisma.notification.findMany(
        {
            where: {
                userId: session.user.id,
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
                    }
                },
                actor: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true,
                        verified: true,
                        role: true,
                    }
                }
            },
            orderBy: {
                createdAt: "desc",
            },
        }
    )

    return NextResponse.json(
        {
            notifications,
        },
        {
            status: 200,
        }
    );
}