import { prisma } from "@/server/prisma";
import { auth } from '@/server/auth';
import { NextRequest, NextResponse } from "next/server";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth.api.getSession({
        headers: req.headers,
    })

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

    const post = await prisma.post.findUnique({
        where: {
            id,
        },
    });

    const like = await prisma.like.findUnique({
        where: {
            userId_postId: {
                userId: session.user.id,
                postId: id,
            }
        }
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

    if (like) {
        return NextResponse.json(
            {
                success: false,
                err: "You have already liked this post",
            },
            {
                status: 400,
            }
        )
    }

    const res = await prisma.like.create(
        {
            data: {
                userId: session.user.id,
                postId: id,
            },
        }
    );

    return NextResponse.json(
        {
            success: true,
            res,
        },
        {
            status: 201,
        }
    )
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth.api.getSession({
        headers: req.headers,
    })

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

    const post = await prisma.post.findUnique({
        where: {
            id,
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

    const like = await prisma.like.findUnique(
        {
            where: {
                userId_postId: {
                    userId: session.user.id,
                    postId: id,
                }
            }
        }
    );

    if (!like) {
        return NextResponse.json(
            {
                success: false,
                err: "You have not liked this post",
            },
            {
                status: 404,
            }
        )
    }

    const res = await prisma.like.delete(
        {
            where: {
                userId_postId: {
                    userId: session.user.id,
                    postId: id,
                }
            }
        }
    );

    return NextResponse.json(
        {
            success: true,
            res,
        },
        {
            status: 201,
        }
    )
}