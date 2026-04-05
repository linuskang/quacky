// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db";
import { auth } from "@/server/auth";
import { Discord } from "@/server/utilities/discord";
import { env } from "@/env";

const webhook = new Discord();

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth.api.getSession(request);

    if (!session) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    const { id } = await params;

    const post = await prisma.post.findUnique({
        where: {
            id,
        },
    });

    if (!post) {
        return NextResponse.json(
            { error: "Post not found" },
            { status: 404 }
        );
    }

    const data = await request.json();

    if (!data.type) {
        return NextResponse.json(
            { error: "Reason and type are required" },
            { status: 400 }
        );
    }

    await webhook.send({
        content: `Post Reported: ${post.id}`,
        embeds: [
            {
                title: "Post Reported",
                description: `A post has been reported by ${session.user.name} (${session.user.id}).\n\n**Reason:** ${data.reason}\n\n**Type:** ${data.type}\n\n[View Post](https://quacky.linus.my/post/${post.id})`,
                fields: [
                    { name: "Post ID", value: post.id, inline: true },
                ],
                color: 0xff0000,
            },
        ],
    });

    // v1 ai moderation prototype: when reports are submitted,
    // send the post content to AI for review.
    // if the content is flagged by AI,
    // automatically unlist and make the post read-only pending human review.

    const aiResponse = await fetch(`${env.AI_SERVICES_URL}/moderate`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            content: post.content,
        }),
    });

    if (!aiResponse.ok) {
        console.log(`AI moderation failed for post ${post.id}:`, await aiResponse.text());
        await webhook.send({
            content: `AI Moderation is currently not available: ${post.id}`,
            embeds: [
                {
                    title: "AI Moderation Failed",
                    description: `Failed to process AI moderation for post ${post.id}. Please try again later. Is the server offline?\n\n[View Post](https://quacky.linus.my/post/${post.id})`,
                    fields: [
                        { name: "Post ID", value: post.id, inline: true },
                    ],
                    color: 0xff0000,
                },
            ],
        });
    }

    const aiJudge = await aiResponse.json();

    console.log(`AI Judge for post ${post.id}:`, aiJudge);

    if (aiJudge.is_inappropriate) {
        await prisma.post.update({
            where: {
                id,
            },
            data: {
                isHidden: true,
                readOnly: true,
            },
        });

        await webhook.send({
            content: `Post Automatically Hidden by AI: ${post.id}`,
            embeds: [
                {
                    title: "Post automatically unlisted due to flagged content",
                    description: `The post
    has been automatically hidden and made read-only by the AI moderation system.\n\n**Reason:** The content was flagged as inappropriate by AI: ${aiJudge.reason}\n\n[View Post](https://quacky.linus.my/post/${post.id})`,
                    fields: [
                        { name: "Post ID", value: post.id, inline: true },
                    ],
                    color: 0xffa500,
                },
            ],
        })
    } else {
        await webhook.send({
            content: `Post Cleared by AI: ${post.id}`,
            embeds: [
                {
                    title: "Post detected as appropriate by AI",
                    description: `Post ${post.id} was reviewed by AI and was not flagged as inappropriate.\n\n[View Post](https://quacky.linus.my/post/${post.id})`,
                    fields: [
                        { name: "Post ID", value: post.id, inline: true },
                    ],
                    color: 0x00ff00,
                },
            ],
        })
    }

    return NextResponse.json(
        { success: true },
        { status: 200 }
    );

}
