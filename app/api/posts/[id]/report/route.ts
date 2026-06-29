import { prisma } from "@/server/prisma";
import { auth } from '@/server/auth';
import { NextRequest, NextResponse } from "next/server";
import { Up } from "@/server/upstream"
import { env } from "@/env";
import { NotificationService } from "@/server/helpers";

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

    const post = await prisma.post.findUnique(
        {
            where: {
                id,
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true,
                        verified: true,
                        role: true,
                    }
                }
            }
        }
    );

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

    const body = await req.json();

    if (!body.reason) {
        return NextResponse.json(
            {
                err: "Reason is required",
            },
            {
                status: 400,
            }
        )
    }

    const startTime = new Date().toLocaleTimeString("en-AU", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });

    const res = await fetch(`${env.AI_URL}/moderate`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            content: post.content,
        }),
    });

    const endTime = new Date().toLocaleTimeString("en-AU", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });

    let moderation: {
        is_inappropriate: boolean;
        reason: string;
    } | null = null;

    if (res.ok) {
        moderation = await res.json();
        console.log("Moderation result:", moderation);
    }

    const events = [
        {
            time: startTime,
            icon: "📨",
            content: "AI Moderation Request Sent",
        },
    ];

    if (!res.ok || !moderation) {
        events.push(
            {
                time: endTime,
                icon: "⚠️",
                content: "Request Failed.",
            }
        );
    } else if (moderation.is_inappropriate) {
        await prisma.post.update({
            where: {
                id: post.id,
            },
            data: {
                flagged: true,
            },
        })
        events.push(
            {
                time: endTime,
                icon: "🚫",
                content: `${moderation.reason}`,
            },
            {
                time: endTime,
                icon: "⚠️",
                content: `Post flagged for review`,
            }
        );

        await NotificationService.send(
            post.authorId,
            'quacky',
            `Hello, ${post.author.name}. \n\nYour [post](${env.BETTER_AUTH_URL}/post/${post.id}) which you made on **${new Date().toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric", })}** has been taken down due to a violation of our [Community Guidelines](https://quacky.space/terms).\n\nReason given: **${moderation?.reason}**\n\nIf you believe this is a mistake, please contact an school administrator.`
        )
    } else {
        events.push(
            {
                time: endTime,
                icon: "✅",
                content: `No violation found`,
            }
        );
    }

    await Up.ingest(
        {
            title: `Post Report: ${post.id}`,
            content: `Reason: ${body.reason}`,
            fields: [
                {
                    name: "Post ID",
                    value: post.id,
                },
                {
                    name: "Reported By",
                    value: `${session.user.email}`,
                },
                {
                    name: "Post Content",
                    value: post.content,
                },
                {
                    name: "Post Author",
                    value: `${post.author.name} (${post.authorId})`,
                },
            ],
            data: {
                post,
                session,
                moderation,
            },
            events,
            actions: [
                {
                    title: "View Post",
                    url: `${env.BETTER_AUTH_URL}/post/${post.id}`,
                    type: "default",
                },
            ],
            icon: "🚨",
        }
    );

    return NextResponse.json(
        {
            success: true,
            message: "Report submitted successfully",
        },
        {
            status: 200,
        }
    )
}