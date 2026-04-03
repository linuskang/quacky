// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db";
import { auth } from "@/server/auth";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth.api.getSession(request);

    if (!session) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    if (session.user.role != "Admin") {
        return NextResponse.json(
            { error: "You are not allowed to use this resource" },
            { status: 403 }
        );
    }

    const { id } = await params;

    const post = await prisma.post.findUnique({
        where: { id },
    });

    if (!post) {
        return NextResponse.json(
            { error: "Post not found" },
            { status: 404 }
        );
    }

    await prisma.post.update({
        where: { id },
        data: { pinned: false },
    });

    return NextResponse.json(
        { success: true },
        { status: 200 }
    );
}
