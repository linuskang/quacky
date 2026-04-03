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

    const postId = (await params).id;

    const body = await request.json();

    if (!body.content || body.content.length > 280) {
        return NextResponse.json(
            { error: "Invalid format" },
            { status: 400 }
        );
    }

    await prisma.reply.create(
        {
            data: {
                content: body.content.trim(),
                authorId: session.user.id,
                postId: postId,
            }
        }
    );

    return NextResponse.json(
        { success: true },
        { status: 201 }
    );
}
