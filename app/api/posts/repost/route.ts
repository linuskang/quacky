import { prisma } from "@/server/prisma";
import { auth } from '@/server/auth';
import { NextRequest, NextResponse } from "next/server";
import { NotificationService } from "@/server/helpers";
import { xp } from "@/lib/var";
import { addXP } from "@/server/users"

export async function POST(req: NextRequest) {
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

    const body = await req.json() as {
        postId: string;
    }

    if (!body.postId) {
        return NextResponse.json(
            {
                err: "Post ID is required",
            },
            {
                status: 400,
            }
        );
    }

    const res = await prisma.post.findFirst(
        {
            where: {
                id: body.postId,
                flagged: false,
                author: {
                    banned: false,
                }
            }
        }
    )

    if (!res) {
        return NextResponse.json(
            {
                err: "Post not found",
            },
            {
                status: 404,
            }
        );
    }

    const post = await prisma.post.create(
        {
            data: {
                authorId: session.user.id,
                repostOfId: body.postId,
                postViews: {
                    create: {
                        userId: session.user.id,
                    },
                },
            },
        }
    )

    await NotificationService.sendEngagement(
        "repost",
        res.authorId,
        session.user.id,
        res.id,
    );

    await addXP(
        session.user.username,
        xp.post
    )

    return NextResponse.json(
        {
            success: true,
            post
        },
        {
            status: 201,
        }
    );
}
