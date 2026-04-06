// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, refer to https://kang.software/git/quacky

import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";

import { auth } from "@/server/auth";
import prisma from "@/server/db";
import Config from "@/server/utilities/config";
import Discord from "@/server/utilities/discord";

const adminUserPatchSchema = z.object({
    action: z.enum(["ban", "unban", "resetName", "resetHandle", "clearBio"]).optional(),
    name: z.string().optional(),
    handle: z.string().optional(),
    bio: z.union([z.string(), z.null()]).optional(),
    image: z.union([z.string(), z.null()]).optional(),
    email: z.string().optional(),
    role: z.union([z.string(), z.null()]).optional(),
    verified: z.boolean().optional(),
    emailVerified: z.boolean().optional(),
    privateAccount: z.boolean().optional(),
    emailNotif: z.boolean().optional(),
    banned: z.boolean().optional(),
    banReason: z.union([z.string(), z.null()]).optional(),
    banExpires: z.union([z.string(), z.null()]).optional(),
}).strict();

function extractReservedHandles(configValue: unknown): string[] {
    if (!configValue || typeof configValue !== "object") {
        return [];
    }

    const handles = (configValue as { handles?: unknown }).handles;

    if (!Array.isArray(handles)) {
        return [];
    }

    return handles.filter((handle): handle is string => typeof handle === "string");
}

function parseOptionalDateTime(value: string | null | undefined): Date | null {
    if (!value) {
        return null;
    }

    const parsedDate = new Date(value);

    if (Number.isNaN(parsedDate.getTime())) {
        throw new Error("Invalid date format for banExpires");
    }

    return parsedDate;
}

function buildDefaultHandle() {
    const randomId = Math.floor(1000000 + Math.random() * 9000000);
    return `user-${randomId}`;
}

async function generateUniqueHandle() {
    const reservedHandles = await Config.get("reserved_handles");
    const reservedHandleList = extractReservedHandles(reservedHandles);

    for (let attempt = 0; attempt < 20; attempt += 1) {
        const candidate = buildDefaultHandle();
        const taken = await prisma.user.findFirst({
            where: {
                handle: candidate,
            },
            select: {
                id: true,
            },
        });

        if (!taken && !reservedHandleList.some((handle) => handle.toLowerCase() === candidate.toLowerCase())) {
            return candidate;
        }
    }

    throw new Error("Unable to generate a unique handle.");
}

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const session = await auth.api.getSession(request);
    const params = await context.params;

    if (!session || session.user.role !== "Admin") {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    const user = await prisma.user.findUnique({
        where: {
            id: params.id,
        },
        select: {
            id: true,
            name: true,
            handle: true,
            bio: true,
            image: true,
            email: true,
            verified: true,
            emailVerified: true,
            privateAccount: true,
            emailNotif: true,
            createdAt: true,
            updatedAt: true,
            banned: true,
            banReason: true,
            banExpires: true,
            role: true,
            _count: {
                select: {
                    followers: true,
                    following: true,
                    posts: true,
                    replies: true,
                    sessions: true,
                },
            },
            posts: {
                orderBy: {
                    createdAt: "desc",
                },
                take: 5,
                select: {
                    id: true,
                    content: true,
                    createdAt: true,
                    pinned: true,
                    readOnly: true,
                    isHidden: true,
                    isDeleted: true,
                },
            },
        },
    });

    if (!user) {
        return NextResponse.json(
            { error: "User not found" },
            { status: 404 }
        );
    }

    return NextResponse.json(
        {
            user: {
                ...user,
                followers: user._count.followers,
                following: user._count.following,
                postCount: user._count.posts,
                replies: user._count.replies,
                sessions: user._count.sessions,
                recentPosts: user.posts,
            },
        },
        { status: 200 }
    );
}

export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const session = await auth.api.getSession(request);
    const params = await context.params;

    if (!session || session.user.role !== "Admin") {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    const user = await prisma.user.findUnique({
        where: {
            id: params.id,
        },
    });

    if (!user) {
        return NextResponse.json(
            { error: "User not found" },
            { status: 404 }
        );
    }

    let rawBody: unknown;

    try {
        rawBody = await request.json();
    } catch {
        return NextResponse.json(
            { error: "Invalid request body" },
            { status: 400 }
        );
    }

    const parsedBody = adminUserPatchSchema.safeParse(rawBody);

    if (!parsedBody.success) {
        return NextResponse.json(
            { error: "Invalid request body" },
            { status: 400 }
        );
    }

    const body = parsedBody.data;
    const action = body.action ?? null;
    const updates: Prisma.UserUpdateInput = {};

    if (body.name !== undefined) {
        const nextName = body.name.trim();

        if (!nextName) {
            return NextResponse.json(
                { error: "Display name cannot be empty" },
                { status: 400 }
            );
        }

        updates.name = nextName;
    }

    if (body.handle !== undefined) {
        const nextHandle = body.handle.trim().replace(/^@+/, "");

        if (!nextHandle) {
            return NextResponse.json(
                { error: "Handle cannot be empty" },
                { status: 400 }
            );
        }

        updates.handle = nextHandle;
    }

    if (body.bio !== undefined) {
        updates.bio = body.bio && body.bio.trim().length > 0 ? body.bio.trim() : null;
    }

    if (body.image !== undefined) {
        updates.image = body.image && body.image.trim().length > 0 ? body.image.trim() : null;
    }

    if (body.email !== undefined) {
        const nextEmail = body.email.trim();

        if (!nextEmail) {
            return NextResponse.json(
                { error: "Email cannot be empty" },
                { status: 400 }
            );
        }

        const existingEmail = await prisma.user.findFirst({
            where: {
                email: nextEmail,
                NOT: {
                    id: user.id,
                },
            },
            select: {
                id: true,
            },
        });

        if (existingEmail) {
            return NextResponse.json(
                { error: "Email is already taken, please choose a different one." },
                { status: 400 }
            );
        }

        updates.email = nextEmail;
    }

    if (body.role !== undefined) {
        updates.role = body.role && body.role.trim().length > 0 ? body.role.trim() : null;
    }

    if (body.verified !== undefined) {
        updates.verified = body.verified;
    }

    if (body.emailVerified !== undefined) {
        updates.emailVerified = body.emailVerified;
    }

    if (body.privateAccount !== undefined) {
        updates.privateAccount = body.privateAccount;
    }

    if (body.emailNotif !== undefined) {
        updates.emailNotif = body.emailNotif;
    }

    if (body.banned !== undefined) {
        const nextBanned = body.banned;
        updates.banned = nextBanned;

        if (!nextBanned) {
            updates.banReason = null;
            updates.banExpires = null;
        }
    }

    if (body.banReason !== undefined) {
        updates.banReason = body.banReason && body.banReason.trim().length > 0 ? body.banReason.trim() : null;
    }

    if (body.banExpires !== undefined) {
        try {
            updates.banExpires = parseOptionalDateTime(body.banExpires);
        } catch (error) {
            return NextResponse.json(
                { error: error instanceof Error ? error.message : "Invalid banExpires" },
                { status: 400 }
            );
        }
    }

    if (action === "ban") {
        updates.banned = true;
        updates.banReason = body.banReason && body.banReason.trim() ? body.banReason.trim() : user.banReason;

        try {
            updates.banExpires = parseOptionalDateTime(body.banExpires);
        } catch (error) {
            return NextResponse.json(
                { error: error instanceof Error ? error.message : "Invalid banExpires" },
                { status: 400 }
            );
        }
    }

    if (action === "unban") {
        updates.banned = false;
        updates.banReason = null;
        updates.banExpires = null;
    }

    if (action === "resetName") {
        updates.name = user.handle;
    }

    if (action === "resetHandle") {
        updates.handle = await generateUniqueHandle();
    }

    if (action === "clearBio") {
        updates.bio = null;
    }

    if (Object.keys(updates).length === 0) {
        return NextResponse.json(
            { error: "No changes provided" },
            { status: 400 }
        );
    }

    if (typeof updates.handle === "string") {
        const handle = updates.handle;
        const reservedHandles = await Config.get("reserved_handles");
        const reservedHandleList = extractReservedHandles(reservedHandles);

        if (reservedHandleList.some((reservedHandle) => reservedHandle.toLowerCase() === handle.toLowerCase())) {
            return NextResponse.json(
                { error: "Handle is reserved, please choose a different one." },
                { status: 400 }
            );
        }

        const existingUser = await prisma.user.findFirst({
            where: {
                handle,
                NOT: {
                    id: user.id,
                },
            },
            select: {
                id: true,
            },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "Handle is already taken, please choose a different one." },
                { status: 400 }
            );
        }
    }

    const updatedUser = await prisma.user.update({
        where: {
            id: user.id,
        },
        data: updates,
        select: {
            id: true,
            name: true,
            handle: true,
            bio: true,
            image: true,
            email: true,
            verified: true,
            emailVerified: true,
            privateAccount: true,
            emailNotif: true,
            createdAt: true,
            updatedAt: true,
            banned: true,
            banReason: true,
            banExpires: true,
            role: true,
            _count: {
                select: {
                    followers: true,
                    following: true,
                    posts: true,
                    replies: true,
                    sessions: true,
                },
            },
            posts: {
                orderBy: {
                    createdAt: "desc",
                },
                take: 5,
                select: {
                    id: true,
                    content: true,
                    createdAt: true,
                    pinned: true,
                    readOnly: true,
                    isHidden: true,
                    isDeleted: true,
                },
            },
        },
    });

    // Log to Discord
    const changeFields = Object.entries(updates).map(([key, value]) => ({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        value: String(value === null ? "(cleared)" : value),
        inline: true,
    }));

    if (changeFields.length > 0) {
        const discord = new Discord();
        discord.send({
            embeds: [
                {
                    title: "User Modified",
                    description: `**${user.name}** (@${user.handle})`,
                    color: 0x3498db,
                    fields: [
                        { name: "User ID", value: user.id, inline: true },
                        { name: "Modified by", value: session.user.email || "Unknown", inline: true },
                        ...changeFields,
                    ],
                    timestamp: new Date().toISOString(),
                },
            ],
        });
    }

    return NextResponse.json(
        {
            user: {
                ...updatedUser,
                followers: updatedUser._count.followers,
                following: updatedUser._count.following,
                postCount: updatedUser._count.posts,
                replies: updatedUser._count.replies,
                sessions: updatedUser._count.sessions,
                recentPosts: updatedUser.posts,
            },
        },
        { status: 200 }
    );
}
