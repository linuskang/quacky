// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import prisma from "@/server/db";

const requestSchema = z.object({
    email: z.string().email(),
});

export async function POST(request: NextRequest) {
    let rawBody: unknown;

    try {
        rawBody = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const parsed = requestSchema.safeParse(rawBody);
    if (!parsed.success) {
        return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const email = parsed.data.email.toLowerCase();
    const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
    });

    return NextResponse.json({ exists: Boolean(user) }, { status: 200 });
}