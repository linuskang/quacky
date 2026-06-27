import { prisma } from "@/server/prisma";
import { auth } from '@/server/auth';
import { NextRequest, NextResponse } from "next/server";

export interface CommentBody {
    content: string;
}

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

    const body = await req.json() as CommentBody;

    if (!body.content) {
        return NextResponse.json(
            {
                err: "Content is required",
            },
            {
                status: 400,
            }
        )
    }

    const content = body.content.trim();

    if (content.length === 0 || content.length > 100) {
        return NextResponse.json(
            {
                err: "Invalid content length",
            },
            {
                status: 400,
            }
        )
    }

    const comment = await prisma.comment.create(
        {
            data: {
                postId: id,
                authorId: session.user.id,
                content,
            }
        }
    );

    return NextResponse.json(
        {
            success: true,
            comment,
        },
        {
            status: 201,
        }
    )
}