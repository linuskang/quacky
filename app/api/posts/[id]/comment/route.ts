import { prisma } from "@/server/prisma";
import { getSession } from '@/server/auth';
import { NextRequest, NextResponse } from "next/server";
import { sendMentionNotifications } from "@/server/mentions";
import { env } from "@/env";
import { NotificationService } from "@/server/helpers";
import { xp } from "@/lib/var";
import { addXP } from "@/server/users";

export interface CommentBody {
    content: string;
}

export async function POST(
    req: NextRequest,
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

    await NotificationService.sendEngagement(
        "comment",
        post.authorId,
        session.user.id,
        post.id,
    );

    await sendMentionNotifications({
        content,
        actorId: session.user.id,
        actorUsername: session.user.username,
        message: `mentioned you in a [comment](${env.BETTER_AUTH_URL}/post/${post.id})`,
    });

    await addXP(
        session.user.username,
        xp.comment
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
