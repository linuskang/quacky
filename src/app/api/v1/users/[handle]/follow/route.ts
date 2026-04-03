// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db";
import { auth } from "@/server/auth";

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ handle: string }> }
) {
    const session = await auth.api.getSession(request);
    const params = await context.params;

    if (!session) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    const following = await prisma.user.findFirst({
        where: {
            id: session.user.id,
        },
        select: {
            following: {
                select: {
                    following: {
                        select: {
                            handle: true,
                        }
                    }
                }
            }
        }
    });

    if (!following) {
        return NextResponse.json(
            { error: "User not found" },
            { status: 404 }
        );
    }

    const isFollowing = following.following.some(f => f.following.handle === params.handle);

    return NextResponse.json(
        { following: isFollowing },
        { status: 200 }
    );
}

export async function POST(
    request: NextRequest,
    context: { params: Promise<{ handle: string }> }
) {
    const session = await auth.api.getSession(request);
    const params = await context.params;

    if (!session) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    const target = await prisma.user.findFirst({
        where: {
            handle: params.handle,
        },
        select: {
            id: true,
        }
    });

    if (!target) {
        return NextResponse.json(
            { error: "User not found" },
            { status: 404 }
        );
    }

    const existingFollow = await prisma.follow.findFirst({
        where: {
            followerId: session.user.id,
            followingId: target.id,
        }
    });

    if (!existingFollow) {
        await prisma.follow.create({
            data: {
                followerId: session.user.id,
                followingId: target.id,
            }
        });
    }

    return NextResponse.json(
        { success: true, following: true },
        { status: 200 }
    );
}
