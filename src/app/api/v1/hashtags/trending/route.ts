// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db";
import { auth } from "@/server/auth";

// GET /api/v1/hashtags/trending — top hashtags by post count in the last 48h
export async function GET(request: NextRequest) {
    const session = await auth.api.getSession(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const since = new Date(Date.now() - 48 * 60 * 60 * 1000);

    // Get recent posts that have hashtags
    const recentPostHashtags = await prisma.postHashtag.findMany({
        where: {
            post: {
                createdAt: { gte: since },
                isDeleted: false,
                isHidden: false,
            },
        },
        select: { hashtagId: true, hashtag: { select: { tag: true } } },
    });

    // Count occurrences per hashtag
    const counts = new Map<string, { tag: string; count: number }>();
    for (const ph of recentPostHashtags) {
        const existing = counts.get(ph.hashtagId);
        if (existing) {
            existing.count++;
        } else {
            counts.set(ph.hashtagId, { tag: ph.hashtag.tag, count: 1 });
        }
    }

    const trending = [...counts.values()]
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);

    return NextResponse.json({ trending }, { status: 200 });
}
