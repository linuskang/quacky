// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db";
import { auth } from "@/server/auth";
import Config from "@/server/utilities/config";

export async function GET(request: NextRequest) {
    const session = await auth.api.getSession(request);

    if (!session) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    const user = await prisma.user.findUnique({
        where: {
            id: session.user.id,
        },
        select: {
            id: true,
            name: true,
            handle: true,
            bio: true,
            image: true,
            email: true,
            verified: true,
            privateAccount: true,
            emailNotif: true,
            createdAt: true,
            banned: true,
        }
    });

    if (!user) {
        return NextResponse.json(
            { error: "User not found" },
            { status: 404 }
        );
    }

    return NextResponse.json(
        { user },
        { status: 200 }
    );
}

export async function PATCH(request: NextRequest) {
    const session = await auth.api.getSession(request);

    if (!session) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    const { name, handle, bio, privateAccount, emailNotif } = await request.json();

    const reservedHandles: any = await Config.get("reserved_handles");
    const reservedHandleList = reservedHandles.handles

    if (reservedHandleList.some((h: string) => h.toLowerCase() === handle.toLowerCase())) {
        return NextResponse.json(
            { error: "Handle is reserved, please choose a different one." },
            { status: 400 }
        );
    }

    const existingUser = await prisma.user.findFirst({
        where: {
            handle,
            NOT: {
                id: session.user.id,
            },
        },
    });

    if (existingUser) {
        return NextResponse.json(
            { error: "Handle is already taken, please choose a different one." },
            { status: 400 }
        );
    }

    const updatedUser = await prisma.user.update(
        {
            where: {
                id: session.user.id,
            },
            data: {
                name,
                handle,
                bio,
                privateAccount,
                emailNotif,
            },
            select: {
                id: true,
                name: true,
                handle: true,
                bio: true,
                image: true,
                privateAccount: true,
                emailNotif: true,
            }
        }
    );

    return NextResponse.json(
        { success: true, user: updatedUser },
        { status: 200 }
    );
}
