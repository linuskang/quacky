// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

import { NextRequest, NextResponse } from "next/server";

import prisma from "@/server/db";

async function getInvite(token: string) {
    return prisma.invite.findUnique({
        where: { token },
        select: {
            id: true,
            email: true,
            handle: true,
            displayName: true,
            used: true,
            expiresAt: true,
        },
    });
}

export async function GET(
    _request: NextRequest,
    context: { params: Promise<{ token: string }> }
) {
    const params = await context.params;
    const invite = await getInvite(params.token);

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

export async function POST(
    _request: NextRequest,
    context: { params: Promise<{ token: string }> }
) {
    const params = await context.params;
    const invite = await getInvite(params.token);

    if (!invite) {
        return NextResponse.json({ error: "Invite not found", status: "invalid" }, { status: 404 });
    }

    if (invite.used) {
        return NextResponse.json({ error: "This invitation has already been used.", status: "used" }, { status: 410 });
    }

    if (invite.expiresAt && invite.expiresAt < new Date()) {
        return NextResponse.json({ error: "This invitation has expired.", status: "expired" }, { status: 410 });
    }

    const existing = await prisma.user.findFirst({
        where: { OR: [{ email: invite.email }, { handle: invite.handle }] },
        select: { id: true },
    });

    if (existing) {
        return NextResponse.json({ error: "An account with this email or handle already exists." }, { status: 409 });
    }

    await prisma.$transaction([
        prisma.user.create({
            data: {
                name: invite.displayName,
                email: invite.email,
                handle: invite.handle,
                emailVerified: true,
            },
        }),
        prisma.invite.update({
            where: { id: invite.id },
            data: { used: true, usedAt: new Date() },
        }),
    ]);

    return NextResponse.json({ success: true }, { status: 201 });
}
