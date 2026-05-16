// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { z } from "zod";
import { Resend } from "resend";

import { auth } from "@/server/auth";
import prisma from "@/server/db";
import Discord from "@/server/utilities/discord";
import { env } from "@/env";

const resend = new Resend(env.RESEND_API_KEY);

const HANDLE_RE = /^[a-zA-Z0-9_-]{1,32}$/;

const createInviteSchema = z.object({
    email: z.string().email(),
    handle: z.string().min(1).max(32).regex(HANDLE_RE, "Handle may only contain letters, numbers, hyphens, and underscores."),
    displayName: z.string().min(1).max(64),
    expiresInDays: z.number().int().min(1).max(365).optional(),
}).strict();

export async function GET(request: NextRequest) {
    const session = await auth.api.getSession(request);

    if (!session || session.user.role !== "Admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const invites = await prisma.invite.findMany({
        orderBy: { createdAt: "desc" },
        take: 100,
        select: {
            id: true,
            email: true,
            handle: true,
            displayName: true,
            used: true,
            usedAt: true,
            expiresAt: true,
            createdAt: true,
            createdById: true,
        },
    });

    return NextResponse.json({ invites }, { status: 200 });
}

export async function POST(request: NextRequest) {
    const session = await auth.api.getSession(request);

    if (!session || session.user.role !== "Admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let rawBody: unknown;
    try {
        rawBody = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const parsed = createInviteSchema.safeParse(rawBody);
    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request body" }, { status: 400 });
    }

    const { email, displayName, expiresInDays } = parsed.data;
    const handle = parsed.data.handle.trim().replace(/^@+/, "");

    // Check handle uniqueness and email uniqueness together
    const existingUser = await prisma.user.findFirst({
        where: { OR: [{ handle }, { email }] },
        select: { id: true, handle: true, email: true },
    });
    if (existingUser?.handle === handle) {
        return NextResponse.json({ error: "Handle is already taken." }, { status: 400 });
    }
    if (existingUser?.email === email) {
        return NextResponse.json({ error: "An account with this email already exists." }, { status: 400 });
    }

    // Check for duplicate pending invite to same email
    const existingInvite = await prisma.invite.findFirst({
        where: {
            email,
            used: false,
            OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
        select: { id: true },
    });
    if (existingInvite) {
        return NextResponse.json({ error: "A pending invite already exists for this email." }, { status: 400 });
    }

    const token = randomBytes(32).toString("base64url");
    const expiresAt = expiresInDays
        ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // default 7 days

    const invite = await prisma.invite.create({
        data: {
            email,
            handle,
            displayName,
            token,
            expiresAt,
            createdById: session.user.id,
        },
    });

    const inviteUrl = `${env.BETTER_AUTH_URL}/invite/${token}`;

    await resend.emails.send({
        from: env.EMAIL_FROM,
        to: email,
        subject: "You've been invited to Quacky!",
        text: [
            `Hi ${displayName},`,
            "",
            `You've been invited to join Quacky as @${handle}.`,
            "",
            `Click the link below to accept your invitation and get started:`,
            inviteUrl,
            "",
            `This invitation expires on ${expiresAt.toLocaleDateString("en-AU", { dateStyle: "long" })}.`,
            "",
            "If you weren't expecting this invitation, you can safely ignore this email.",
            "",
            "— The Quacky Team",
        ].join("\n"),
    });

    const discord = new Discord();
    discord.send({
        embeds: [
            {
                title: "Invite Created",
                description: `Invite sent to **${email}** (@${handle})`,
                color: 0x2ecc71,
                fields: [
                    { name: "Created by", value: session.user.email || "Unknown", inline: true },
                    { name: "Expires", value: expiresAt.toISOString(), inline: true },
                ],
                timestamp: new Date().toISOString(),
            },
        ],
    });

    return NextResponse.json({ invite }, { status: 201 });
}
