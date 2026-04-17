// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://linuskang.au/quacky

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db";
import { auth } from "@/server/auth";

// GET — fetch the current user's received warm fuzzies (anonymised — no sender info)
export async function GET(request: NextRequest) {
    const session = await auth.api.getSession(request);

    if (!session) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const fuzzies = await prisma.warmFuzzy.findMany({
        where: {
            recipientId: session.user.id,
            isHidden: false,
        },
        select: {
            id: true,
            message: true,
            createdAt: true,
            isReported: true,
            // senderId intentionally excluded — anonymity preserved
        },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, fuzzies });
}

// POST — send a warm fuzzy to another user
export async function POST(request: NextRequest) {
    const session = await auth.api.getSession(request);

    if (!session) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    const message = typeof data.message === "string" ? data.message.trim() : "";
    const recipientHandle = typeof data.recipientHandle === "string" ? data.recipientHandle.trim() : "";

    if (!recipientHandle) {
        return NextResponse.json({ success: false, error: "Recipient is required." }, { status: 400 });
    }

    if (!message || message.length > 280) {
        return NextResponse.json({ success: false, error: "Message must be between 1 and 280 characters." }, { status: 400 });
    }

    const recipient = await prisma.user.findFirst({
        where: { handle: recipientHandle, banned: false },
        select: { id: true, name: true },
    });

    if (!recipient) {
        return NextResponse.json({ success: false, error: "User not found." }, { status: 404 });
    }

    if (recipient.id === session.user.id) {
        return NextResponse.json({ success: false, error: "You can't send yourself a Warm Fuzzy." }, { status: 400 });
    }

    const fuzzy = await prisma.warmFuzzy.create({
        data: {
            senderId: session.user.id,
            recipientId: recipient.id,
            message,
        },
    });

    // Notify the recipient — actor is "quacky" (system) to preserve anonymity
    await prisma.notification.create({
        data: {
            userId: recipient.id,
            actorId: "quacky",
            type: "fuzzy:received",
            message: "Someone dropped a Warm Fuzzy in your bag! 💛",
        },
    }).catch(() => {
        // Non-fatal — notification delivery is best-effort
    });

    return NextResponse.json({ success: true, id: fuzzy.id }, { status: 201 });
}
