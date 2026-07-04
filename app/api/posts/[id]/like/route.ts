import { prisma } from "@/server/prisma";
import { getSession } from '@/server/auth';
import { NextRequest, NextResponse } from "next/server";
import { NotificationService } from "@/server/helpers";

export async function POST(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getSession()

    if (!session) {
        return NextResponse.json(
            {
                err: "Unauthorized",
            },
            {
                status: 401,
            }
        )
    }

    const { id } = await params;

    const post = await prisma.post.findFirst({
        where: {
            id,
            flagged: false,
            author: {
                banned: false,
            },
        },
    });

    if (!post) {
        return NextResponse.json(
            {
                err: "Post not found",
            },
            {
                status: 404,
            }
        )
    }

    const res = await prisma.like.createMany(
        {
            data: [
                {
                    userId: session.user.id,
                    postId: id,
                },
            ],
            skipDuplicates: true,
        }
    );

    if (res.count === 1) {
        await NotificationService.sendEngagement(
            "like",
            post.authorId,
            session.user.id,
            post.id,
        );
    }

    return NextResponse.json(
        {
            success: true,
            liked: true,
            res,
        },
        {
            status: 200,
        }
    )
}

export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getSession()

    if (!session) {
        return NextResponse.json(
            {
                err: "Unauthorized",
            },
            {
                status: 401,
            }
        )
    }

    const { id } = await params;

    const post = await prisma.post.findFirst({
        where: {
            id,
            flagged: false,
            author: {
                banned: false,
            },
        },
    });

    if (!post) {
        return NextResponse.json(
            {
                err: "Post not found",
            },
            {
                status: 404,
            }
        )
    }

    const res = await prisma.like.deleteMany(
        {
            where: {
                userId: session.user.id,
                postId: id,
            }
        }
    );

    if (res.count === 1) {
        await NotificationService.removeEngagement(
            "like",
            post.authorId,
            session.user.id,
            post.id,
        );
    }

    return NextResponse.json(
        {
            success: true,
            liked: false,
            res,
        },
        {
            status: 200,
        }
    )
}
