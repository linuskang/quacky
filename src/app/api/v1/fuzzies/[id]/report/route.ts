// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://linuskang.au/quacky

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db";
import { auth } from "@/server/auth";
import { Discord } from "@/server/utilities/discord";
import { env } from "@/env";

const webhook = new Discord();

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth.api.getSession(request);

    if (!session) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Only the recipient can report a fuzzy
    const fuzzy = await prisma.warmFuzzy.findUnique({
        where: { id },
    });

    if (!fuzzy) {
        return NextResponse.json({ success: false, error: "Not found." }, { status: 404 });
    }

    if (fuzzy.recipientId !== session.user.id) {
        return NextResponse.json({ success: false, error: "Forbidden." }, { status: 403 });
    }

    const data = await request.json();
    const reason = typeof data.reason === "string" ? data.reason.trim() : "No reason provided";

    // Mark as reported
    await prisma.warmFuzzy.update({
        where: { id },
        data: { isReported: true },
    });

    // Discord notification
    await webhook.send({
        content: `Warm Fuzzy Reported: ${fuzzy.id}`,
        embeds: [
            {
                title: "Warm Fuzzy Reported",
                description: `A Warm Fuzzy has been reported by ${session.user.name} (@${session.user.handle}).\n\n**Message:**\n> ${fuzzy.message}\n\n**Reason:** ${reason}`,
                fields: [
                    { name: "Fuzzy ID", value: fuzzy.id, inline: true },
                    { name: "Recipient ID", value: session.user.id, inline: true },
                ],
                color: 0xff6600,
            },
        ],
    });

    // AI moderation — same pattern as post reporting
    try {
        const aiResponse = await fetch(`${env.AI_SERVICES_URL}/moderate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: fuzzy.message }),
        });

        if (aiResponse.ok) {
            const aiJudge = await aiResponse.json();

            if (aiJudge.is_inappropriate) {
                // Auto-hide the fuzzy
                await prisma.warmFuzzy.update({
                    where: { id },
                    data: { isHidden: true },
                });

                await webhook.send({
                    content: `Warm Fuzzy Auto-Hidden: ${fuzzy.id}`,
                    embeds: [
                        {
                            title: "Warm Fuzzy automatically hidden due to flagged content",
                            description: `**AI Reason:** ${aiJudge.reason as string}`,
                            fields: [
                                { name: "Fuzzy ID", value: fuzzy.id, inline: true },
                            ],
                            color: 0xffa500,
                        },
                    ],
                });

                await prisma.notification.create({
                    data: {
                        type: "system:message",
                        message: `Hello,\nYour Warm Fuzzy (ID: ${fuzzy.id}) has been removed because it was flagged as inappropriate by our moderation system.\n\nReason provided: ${aiJudge.reason}\n\nIf you believe this was a mistake, please contact our support team for further assistance.`,
                        actorId: "quacky",
                        userId: fuzzy.senderId,
                    },
                });
            } else {
                await webhook.send({
                    content: `Warm Fuzzy Cleared by AI: ${fuzzy.id}`,
                    embeds: [
                        {
                            title: "Warm Fuzzy detected as appropriate by AI",
                            description: `Fuzzy ${fuzzy.id} was reviewed and not flagged.`,
                            color: 0x00ff00,
                        },
                    ],
                });
            }
        } else {
            await webhook.send({
                content: `AI Moderation unavailable for Warm Fuzzy: ${fuzzy.id}`,
                embeds: [
                    {
                        title: "AI Moderation Failed",
                        description: `Could not process AI moderation for fuzzy ${fuzzy.id}. Manual review required.`,
                        color: 0xff0000,
                    },
                ],
            });
        }
    } catch {
        // AI service unavailable — report already logged to Discord for manual review
    }

    return NextResponse.json({ success: true }, { status: 200 });
}
