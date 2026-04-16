// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db";
import { auth } from "@/server/auth";

// GET — returns count of unread notifications for the current user
export async function GET(request: NextRequest) {
    const session = await auth.api.getSession(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const count = await prisma.notification.count({
        where: { userId: session.user.id, read: false },
    });

    return NextResponse.json({ count }, { status: 200 });
}
