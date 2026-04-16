// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db";
import { auth } from "@/server/auth";

// GET — check if post is bookmarked by current user
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth.api.getSession(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const postId = (await params).id;
    const existing = await prisma.bookmark.findUnique({
        where: { postId_userId: { postId, userId: session.user.id } },
        select: { postId: true },
    });

    return NextResponse.json({ bookmarked: !!existing }, { status: 200 });
}

// POST — toggle bookmark
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth.api.getSession(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const postId = (await params).id;
    const userId = session.user.id;

    const existing = await prisma.bookmark.findUnique({
        where: { postId_userId: { postId, userId } },
        select: { postId: true },
    });

    if (existing) {
        await prisma.bookmark.delete({ where: { postId_userId: { postId, userId } } });
        return NextResponse.json({ success: true, bookmarked: false }, { status: 200 });
    } else {
        await prisma.bookmark.create({ data: { postId, userId } });
        return NextResponse.json({ success: true, bookmarked: true }, { status: 201 });
    }
}
