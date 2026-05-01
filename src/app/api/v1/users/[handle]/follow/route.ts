// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db";
import { auth } from "@/server/auth";
import Discord from "@/server/utilities/discord";

// GET — is the current user following this handle?
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ handle: string }> }
) {
    const session = await auth.api.getSession(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { handle } = await context.params;

    const target = await prisma.user.findFirst({
        where: { handle },
        select: { id: true },
    });

    if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const existing = await prisma.follow.findFirst({
        where: { followerId: session.user.id, followingId: target.id },
    });

    return NextResponse.json({ following: !!existing }, { status: 200 });
}

// POST — follow this handle (idempotent)
export async function POST(
    request: NextRequest,
    context: { params: Promise<{ handle: string }> }
) {
    const session = await auth.api.getSession(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { handle } = await context.params;

    const target = await prisma.user.findFirst({
        where: { handle },
        select: { id: true },
    });

    if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const existing = await prisma.follow.findFirst({
        where: { followerId: session.user.id, followingId: target.id },
    });

    if (!existing) {
        await prisma.follow.create({
            data: { followerId: session.user.id, followingId: target.id },
        });

        // Notify the followed user (skip self-follow edge case)
        if (target.id !== session.user.id) {
            await prisma.notification.create({
                data: {
                    userId: target.id,
                    actorId: session.user.id,
                    type: "user:follow",
                    message: "followed you.",
                },
            });
        }

        void new Discord().send({
            embeds: [{
                title: "User Followed",
                color: 0x2ECC71,
                author: { name: `${session.user.name} (@${(session.user as any).handle})`, icon_url: session.user.image ?? undefined },
                fields: [{ name: "Following", value: `@${handle}`, inline: true }],
                timestamp: new Date().toISOString(),
            }],
        });
    }

    return NextResponse.json({ success: true, following: true }, { status: 200 });
}
