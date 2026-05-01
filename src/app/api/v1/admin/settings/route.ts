// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/server/auth";
import prisma from "@/server/db";
import Discord from "@/server/utilities/discord";

const patchSchema = z.object({
    selfRegister: z.boolean(),
}).strict();

async function getSelfRegister(): Promise<boolean> {
    const config = await prisma.config.findUnique({ where: { key: "self_register" } });
    if (!config) return true;
    return (config.value as { enabled?: boolean })?.enabled !== false;
}

export async function GET(request: NextRequest) {
    const session = await auth.api.getSession(request);

    if (!session || session.user.role !== "Admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const selfRegister = await getSelfRegister();
    return NextResponse.json({ selfRegister }, { status: 200 });
}

export async function PATCH(request: NextRequest) {
    const session = await auth.api.getSession(request);

    if (!session || session.user.role !== "Admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let rawBody: unknown;
    try {
        rawBody = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const parsed = patchSchema.safeParse(rawBody);
    if (!parsed.success) {
        return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    await prisma.config.upsert({
        where: { key: "self_register" },
        update: { value: { enabled: parsed.data.selfRegister } },
        create: { key: "self_register", value: { enabled: parsed.data.selfRegister } },
    });

    const discord = new Discord();
    discord.send({
        embeds: [
            {
                title: "Settings Updated",
                description: `Self-registration **${parsed.data.selfRegister ? "enabled" : "disabled"}** by ${session.user.email ?? "Unknown"}.`,
                color: 0xf39c12,
                timestamp: new Date().toISOString(),
            },
        ],
    });

    return NextResponse.json({ selfRegister: parsed.data.selfRegister }, { status: 200 });
}
