// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { Discord } from "@/server/utilities/discord";
import prisma from "@/server/db";

const webhook = new Discord();

export async function POST(
    request: NextRequest,
    context: { params: Promise<{ handle: string }> }
) {
    const session = await auth.api.getSession(request);

    if (!session) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    const params = await context.params;
    const { handle } = params;

    const user = await prisma.user.findFirst({
        where: {
            handle,
            banned: false,
        },
        select: {
            id: true,
            handle: true
        },
    });

    if (!user) {
        return NextResponse.json(
            { error: "User not found" },
            { status: 404 }
        );
    }

    let body: { reason?: string };

    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    if (!body.reason || body.reason.trim().length === 0) {
        return NextResponse.json({ error: "Reason is required" }, { status: 400 });
    }

    const payload = {
        content: `User @${user.handle} (${user.id}) has been reported by @${session.user.handle}.`,
        embeds: [
            {
                title: "Report Details",
                fields: [
                    { name: "Reported User", value: `@${user.handle} (${user.id})`, inline: true },
                    { name: "Reporter", value: `@${session.user.handle} (${session.user.id})`, inline: true },
                    { name: "Reason", value: body.reason },
                ],
                color: 0xff0000,
                timestamp: new Date().toISOString(),
            },
        ],
    };

    const result = await webhook.send(payload);

    if (!result.success) {
        return NextResponse.json(
            { error: result.error },
            { status: 500 }
        );
    }

    return NextResponse.json(
        { success: true },
        { status: 200 }
    );
}
