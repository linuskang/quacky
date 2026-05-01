// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://linuskang.au/quacky

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
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const userId = session.user.id;

    try {
        const body = await request.json();
        const optionIndex = typeof body.optionIndex === "number" ? body.optionIndex : -1;

        const post = await prisma.post.findUnique({
            where: { id, isDeleted: false },
            select: { id: true, poll: true },
        });

        if (!post || !post.poll) {
            return NextResponse.json({ error: "Poll not found" }, { status: 404 });
        }

        const poll = post.poll as { options: string[] };
        if (optionIndex < 0 || optionIndex >= poll.options.length) {
            return NextResponse.json({ error: "Invalid option" }, { status: 400 });
        }

        // Upsert: creates a new vote or updates an existing one (allows changing vote)
        await prisma.pollVote.upsert({
            where: { userId_postId: { userId, postId: id } },
            create: { userId, postId: id, optionIndex },
            update: { optionIndex },
        });

        // Return updated vote counts
        const votes = await prisma.pollVote.findMany({
            where: { postId: id },
            select: { optionIndex: true },
        });

        const counts = poll.options.map((_, i) => votes.filter((v) => v.optionIndex === i).length);

        void new Discord().send({
            embeds: [{
                title: "Poll Vote Cast",
                color: 0x9B59B6,
                author: { name: `${session.user.name} (@${(session.user as any).handle})`, icon_url: session.user.image ?? undefined },
                fields: [
                    { name: "Post ID", value: id, inline: true },
                    { name: "Option", value: `#${optionIndex + 1}: ${poll.options[optionIndex]}`, inline: true },
                ],
                timestamp: new Date().toISOString(),
            }],
        });

        return NextResponse.json({ success: true, pollVoteCounts: counts, userVote: optionIndex });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
