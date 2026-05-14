// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db";
import { auth } from "@/server/auth";
import { linkHashtagsToPost } from "@/lib/hashtags";
import Discord from "@/server/utilities/discord";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth.api.getSession(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const parentId = (await params).id;
    const body = await request.json();
    const content = typeof body.content === "string" ? body.content.trim() : "";

    if (!content || content.length > 400) {
        return NextResponse.json({ error: "Invalid format" }, { status: 400 });
    }

    const parent = await prisma.post.findUnique({
        where: { id: parentId, isDeleted: false },
        select: { id: true, readOnly: true, authorId: true },
    });

    if (!parent) return NextResponse.json({ error: "Post not found" }, { status: 404 });
    if (parent.readOnly) return NextResponse.json({ error: "Post is read-only" }, { status: 403 });

    const reply = await prisma.post.create({
        data: {
            type: "reply",
            content,
            authorId: session.user.id,
            parentId,
        },
        select: { id: true },
    });

    await linkHashtagsToPost(prisma, reply.id, content);

    void new Discord().send({
        embeds: [{
            title: "Reply Created",
            description: content.length > 100 ? content.slice(0, 100) + "…" : content,
            color: 0x5865F2,
            author: { name: `${session.user.name} (@${(session.user as any).handle})`, icon_url: session.user.image ?? undefined },
            fields: [
                { name: "Reply ID", value: reply.id, inline: true },
                { name: "Parent ID", value: parentId, inline: true },
            ],
            timestamp: new Date().toISOString(),
        }],
    });

    // Notify parent post author (skip if replying to own post)
    if (parent.authorId !== session.user.id) {
        await prisma.notification.create({
            data: {
                userId: parent.authorId,
                actorId: session.user.id,
                type: "post:reply",
                postId: reply.id,
                message: "replied to your post.",
            },
        });
    }

    return NextResponse.json({ success: true }, { status: 201 });
}
