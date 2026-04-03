// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db";
import { auth } from "@/server/auth";

export async function GET(request: NextRequest) {
    const session = await auth.api.getSession(request);

    if (!session) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
        return NextResponse.json(
            { error: "Query is required" },
            { status: 400 }
        );
    }

    const posts = await prisma.post.findMany({
        where: {
            content: {
                contains: query,
                mode: "insensitive",
            },
            isHidden: false,
            isDeleted: false,
        },
        include: {
            author: {
                select: {
                    id: true,
                    name: true,
                    handle: true,
                    image: true,
                    verified: true,
                },
            },
        },
    });

    const users = await prisma.user.findMany({
        where: {
            OR: [
                {
                    name: {
                        contains: query,
                        mode: "insensitive",
                    },
                },
                {
                    handle: {
                        contains: query,
                        mode: "insensitive",
                    },
                },
            ],
        },
        select: {
            id: true,
            name: true,
            handle: true,
            image: true,
            verified: true,
            bio: true,
            privateAccount: true,
        },
    });

    return NextResponse.json(
        { success: true, posts, users },
        { status: 200 }
    );

}
