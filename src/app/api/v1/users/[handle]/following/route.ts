// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db";
import { auth } from "@/server/auth";

// GET — list of users this handle follows
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

    const follows = await prisma.follow.findMany({
        where: { followerId: target.id },
        orderBy: { createdAt: "desc" },
        select: {
            following: {
                select: { id: true, name: true, handle: true, image: true, verified: true, bio: true },
            },
        },
    });

    // Include whether the current user follows each person in the list
    const currentUserFollowingIds = await prisma.follow.findMany({
        where: { followerId: session.user.id },
        select: { followingId: true },
    });
    const followingSet = new Set(currentUserFollowingIds.map((f) => f.followingId));

    const users = follows.map((f) => ({
        ...f.following,
        isFollowedByMe: followingSet.has(f.following.id),
    }));

    return NextResponse.json({ users }, { status: 200 });
}
