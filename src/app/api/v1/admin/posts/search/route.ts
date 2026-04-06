// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, refer to https://kang.software/git/quacky

import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/server/auth";
import prisma from "@/server/db";

export async function GET(request: NextRequest) {
    const session = await auth.api.getSession(request);

    if (!session || session.user.role !== "Admin") {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim();

    if (!query) {
        return NextResponse.json(
            { error: "Query is required" },
            { status: 400 }
        );
    }

    const posts = await prisma.post.findMany({
        where: {
            OR: [
                {
                    id: {
                        equals: query,
                    },
                },
                {
                    content: {
                        contains: query,
                        mode: "insensitive",
                    },
                },
                {
                    author: {
                        is: {
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
                    },
                },
            ],
        },
        orderBy: {
            createdAt: "desc",
        },
        take: 12,
        select: {
            id: true,
            content: true,
            pinned: true,
            readOnly: true,
            isHidden: true,
            isDeleted: true,
            createdAt: true,
            updatedAt: true,
            author: {
                select: {
                    id: true,
                    name: true,
                    handle: true,
                    image: true,
                    verified: true,
                    role: true,
                },
            },
            _count: {
                select: {
                    likes: true,
                    replies: true,
                },
            },
        },
    });

    return NextResponse.json(
        { posts },
        { status: 200 }
    );
}
