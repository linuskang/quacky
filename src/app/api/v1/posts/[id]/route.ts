// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db";
import { auth } from "@/server/auth";

export async function GET(
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

    const post = await prisma.post.findUnique(
        {
            where: {
                id: (await params).id,
                isDeleted: false,
            },
            select: {
                id: true,
                author: {
                    select: {
                        name: true,
                        handle: true,
                        image: true,
                        verified: true,
                    }
                },
                content: true,
                attachments: true,
                pinned: true,
                readOnly: true,
                likes: {
                    select: {
                        user: {
                            select: {
                                id: true,
                                handle: true,
                            },
                        },
                    }
                },
                replies: {
                    where: {
                        isHidden: false,
                        isDeleted: false,
                    },
                    select: {
                        id: true,
                        author: {
                            select: {
                                id: true,
                                name: true,
                                handle: true,
                                image: true,
                                verified: true,
                            },
                        },
                        content: true,
                        createdAt: true,
                    }
                },
                isHidden: true,
                isDeleted: true,
                createdAt: true,
                updatedAt: true,
            }
        }
    );

    if (!post) {
        return NextResponse.json(
            { error: "Post not found" },
            { status: 404 }
        );
    }

    return NextResponse.json(
        { post },
        { status: 200 }
    );
}
