// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db";
import { auth } from "@/server/auth";

// GET — top 5 most-followed users the current user isn't already following
export async function GET(request: NextRequest) {
    const session = await auth.api.getSession(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const users = await prisma.user.findMany({
        where: {
            id: { not: session.user.id },
            banned: false,
            privateAccount: false,
            followers: { none: { followerId: session.user.id } },
        },
        select: {
            id: true,
            name: true,
            handle: true,
            image: true,
            verified: true,
            _count: { select: { followers: true } },
        },
        orderBy: {
            followers: { _count: "desc" },
        },
        take: 5,
    });

    return NextResponse.json({
        users: users.map((u) => ({
            id: u.id,
            name: u.name,
            handle: u.handle,
            image: u.image,
            verified: u.verified,
            followers: u._count.followers,
        })),
    });
}
