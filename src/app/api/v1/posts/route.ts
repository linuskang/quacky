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

    const posts = await prisma.post.findMany({
        where: {
            isHidden: false,
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
                    author: {
                        select: {
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
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return NextResponse.json(
        { posts },
        { status: 200 }
    );
}

export async function POST(request: NextRequest) {
    const session = await auth.api.getSession(request);

    if (!session) {
        return NextResponse.json(
            { success: false, error: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        const body = await request.json();
        const rawAttachments = Array.isArray(body.attachments) ? body.attachments : [];
        const attachments = rawAttachments.map((att: any) => ({
            key: typeof att?.key === "string" ? att.key : "",
            url: typeof att?.url === "string" ? att.url : "",
            name: typeof att?.name === "string" ? att.name : "file",
            mimeType: typeof att?.mimeType === "string" ? att.mimeType : "application/octet-stream",
            size: typeof att?.size === "number" ? att.size : 0,
            kind: att?.kind === "image" || att?.kind === "video" || att?.kind === "file" ? att.kind : "file",
        })).filter((att: any) => att.key && att.url);
        const content = typeof body.content === "string" ? body.content.trim() : "";

        if (content.length > 280 || (!content && attachments.length === 0)) {
            return NextResponse.json(
                { success: false, error: "Invalid format" },
                { status: 400 }
            );
        }

        if (attachments.length > 3) {
            return NextResponse.json(
                { success: false, error: `A post can have at most 3 attachments` },
                { status: 400 }
            );
        }

        const result = await prisma.post.create({
            data: {
                content,
                authorId: session.user.id,
                attachments,
            },
            select: {
                id: true,
            },
        });

        return NextResponse.json(
            { result },
            { status: 201 }
        );

    } catch (err: any) {

        return NextResponse.json(
            { success: false, error: err.message },
            { status: 500 }
        );

    }
}
