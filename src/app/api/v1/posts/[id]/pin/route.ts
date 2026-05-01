// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db";
import { auth } from "@/server/auth";
import Discord from "@/server/utilities/discord";

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

    const nextPinned = !post.pinned;
    await prisma.post.update({
        where: { id },
        data: { pinned: nextPinned },
    });

    void new Discord().send({
        embeds: [{
            title: nextPinned ? "Post Pinned" : "Post Unpinned",
            color: nextPinned ? 0xF1C40F : 0x95A5A6,
            author: { name: `${session.user.name} (@${(session.user as any).handle})`, icon_url: session.user.image ?? undefined },
            fields: [{ name: "Post ID", value: id, inline: true }],
            timestamp: new Date().toISOString(),
        }],
    });

    return NextResponse.json(
        { success: true },
        { status: 200 }
    );
}
