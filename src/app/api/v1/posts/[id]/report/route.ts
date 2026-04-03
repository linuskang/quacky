// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db";
import { auth } from "@/server/auth";
import { Discord } from "@/server/utilities/discord";

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

    return NextResponse.json(
        { success: true },
        { status: 200 }
    );

}
