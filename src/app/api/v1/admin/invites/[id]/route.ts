// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/server/auth";
import prisma from "@/server/db";
import Discord from "@/server/utilities/discord";

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const session = await auth.api.getSession(request);
    const params = await context.params;

    if (!session || session.user.role !== "Admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const invite = await prisma.invite.findUnique({
        where: { id: params.id },
    });

    if (!invite) {
        return NextResponse.json({ error: "Invite not found" }, { status: 404 });
    }

    if (invite.used) {
        return NextResponse.json({ error: "Cannot revoke an invite that has already been used." }, { status: 400 });
    }

    await prisma.invite.delete({ where: { id: params.id } });

    const discord = new Discord();
    discord.send({
        embeds: [
            {
                title: "Invite Revoked",
                description: `Invite for **${invite.email}** (@${invite.handle}) was revoked.`,
                color: 0xe74c3c,
                fields: [
                    { name: "Revoked by", value: session.user.email || "Unknown", inline: true },
                ],
                timestamp: new Date().toISOString(),
            },
        ],
    });

    return NextResponse.json({ ok: true }, { status: 200 });
}
