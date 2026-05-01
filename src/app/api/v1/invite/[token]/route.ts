// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

import { NextRequest, NextResponse } from "next/server";

import prisma from "@/server/db";

export async function GET(
    _request: NextRequest,
    context: { params: Promise<{ token: string }> }
) {
    const params = await context.params;

    const invite = await prisma.invite.findUnique({
        where: { token: params.token },
        select: {
            id: true,
            email: true,
            handle: true,
            displayName: true,
            used: true,
            expiresAt: true,
        },
    });

    if (!invite) {
        return NextResponse.json({ error: "Invite not found", status: "invalid" }, { status: 404 });
    }

    if (invite.used) {
        return NextResponse.json({ error: "This invitation has already been used.", status: "used" }, { status: 410 });
    }

    if (invite.expiresAt && invite.expiresAt < new Date()) {
        return NextResponse.json({ error: "This invitation has expired.", status: "expired" }, { status: 410 });
    }

    return NextResponse.json({
        invite: {
            email: invite.email,
            handle: invite.handle,
            displayName: invite.displayName,
            expiresAt: invite.expiresAt,
        },
    }, { status: 200 });
}
