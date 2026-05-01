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

    const postId = (await params).id;

    const post = await prisma.post.findUnique({
        where: { id: postId },
        select: { authorId: true, isDeleted: true }
    });

    if (!post) {
        return NextResponse.json(
            { error: "Post not found" },
            { status: 404 }
        );
    }

    const isAuthor = post.authorId === session.user.id;
    const isAdmin = session.user.role === "Admin";

    if (!isAuthor && !isAdmin) {
        return NextResponse.json(
            { error: "Forbidden" },
            { status: 403 }
        );
    }

    await prisma.post.update({
        where: { id: postId },
        data: { isDeleted: true }
    });

    void new Discord().send({
        embeds: [{
            title: "Post Deleted",
            color: 0xED4245,
            author: { name: `${session.user.name} (@${(session.user as any).handle})`, icon_url: session.user.image ?? undefined },
            fields: [
                { name: "Post ID", value: postId, inline: true },
                { name: "By", value: isAdmin && !isAuthor ? "Admin" : "Author", inline: true },
            ],
            timestamp: new Date().toISOString(),
        }],
    });

    return NextResponse.json(
        { success: true },
    );

}
