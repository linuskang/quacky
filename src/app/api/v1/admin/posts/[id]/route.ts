// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, refer to https://kang.software/git/quacky

import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";

import { auth } from "@/server/auth";
import prisma from "@/server/db";
import Discord from "@/server/utilities/discord";

const adminPostPatchSchema = z.object({
    content: z.string().optional(),
    attachments: z.union([z.string(), z.array(z.unknown()), z.null()]).optional(),
    authorHandle: z.string().optional(),
    authorId: z.string().optional(),
    pinned: z.boolean().optional(),
    readOnly: z.boolean().optional(),
    isHidden: z.boolean().optional(),
    isDeleted: z.boolean().optional(),
}).strict();

function parseAttachments(value: string | unknown[] | null | undefined): Prisma.JsonArray | null {
    if (value === undefined || value === null) {
        return null;
    }

    if (Array.isArray(value)) {
        return value as Prisma.JsonArray;
    }

    const trimmed = value.trim();

    if (!trimmed) {
        return null;
    }

    const parsed: unknown = JSON.parse(trimmed);

    if (!Array.isArray(parsed)) {
        throw new Error("Attachments must be a JSON array.");
    }

    return parsed as Prisma.JsonArray;
}

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const session = await auth.api.getSession(request);
    const params = await context.params;

    if (!session || session.user.role !== "Admin") {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    const post = await prisma.post.findUnique({
        where: {
            id: params.id,
        },
        select: {
            id: true,
            content: true,
            attachments: true,
            pinned: true,
            readOnly: true,
            isHidden: true,
            isDeleted: true,
            createdAt: true,
            updatedAt: true,
            authorId: true,
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
            replies: {
                where: {
                    isHidden: false,
                    isDeleted: false,
                },
                orderBy: {
                    createdAt: "desc",
                },
                take: 5,
                select: {
                    id: true,
                    content: true,
                    createdAt: true,
                    isHidden: true,
                    isDeleted: true,
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
            },
        },
    });

    if (!post) {
        return NextResponse.json(
            { error: "Post not found" },
            { status: 404 }
        );
    }

    return NextResponse.json(
        {
            post: {
                ...post,
                likeCount: post._count.likes,
                replyCount: post._count.replies,
                recentReplies: post.replies,
            },
        },
        { status: 200 }
    );
}

export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const session = await auth.api.getSession(request);
    const params = await context.params;

    if (!session || session.user.role !== "Admin") {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    const post = await prisma.post.findUnique({
        where: {
            id: params.id,
        },
    });

    if (!post) {
        return NextResponse.json(
            { error: "Post not found" },
            { status: 404 }
        );
    }

    let rawBody: unknown;

    try {
        rawBody = await request.json();
    } catch {
        return NextResponse.json(
            { error: "Invalid request body" },
            { status: 400 }
        );
    }

    const parsedBody = adminPostPatchSchema.safeParse(rawBody);

    if (!parsedBody.success) {
        return NextResponse.json(
            { error: "Invalid request body" },
            { status: 400 }
        );
    }

    const body = parsedBody.data;
    const updates: Prisma.PostUpdateInput = {};

    let nextContent = post.content;
    let nextAttachments: Prisma.JsonArray | null = Array.isArray(post.attachments) ? post.attachments : null;

    if (body.content !== undefined) {
        nextContent = body.content.trim();
        updates.content = nextContent;
    }

    if (body.attachments !== undefined) {
        try {
            nextAttachments = parseAttachments(body.attachments);
            if (nextAttachments !== null) {
                updates.attachments = nextAttachments;
            } else {
                (updates as any).attachments = null;
            }
        } catch (error) {
            return NextResponse.json(
                { error: error instanceof Error ? error.message : "Invalid attachments" },
                { status: 400 }
            );
        }
    }

    if (body.authorHandle && body.authorHandle.trim()) {
        const author = await prisma.user.findFirst({
            where: {
                handle: body.authorHandle.trim().replace(/^@+/, ""),
            },
            select: {
                id: true,
            },
        });

        if (!author) {
            return NextResponse.json(
                { error: "Author not found" },
                { status: 404 }
            );
        }

        (updates as any).authorId = author.id;
    } else if (body.authorId && body.authorId.trim()) {
        const author = await prisma.user.findUnique({
            where: {
                id: body.authorId.trim(),
            },
            select: {
                id: true,
            },
        });

        if (!author) {
            return NextResponse.json(
                { error: "Author not found" },
                { status: 404 }
            );
        }

        (updates as any).authorId = author.id;
    }

    if (body.pinned !== undefined) {
        updates.pinned = body.pinned;
    }

    if (body.readOnly !== undefined) {
        updates.readOnly = body.readOnly;
    }

    if (body.isHidden !== undefined) {
        updates.isHidden = body.isHidden;
    }

    if (body.isDeleted !== undefined) {
        updates.isDeleted = body.isDeleted;
    }

    if (!nextContent && (!nextAttachments || nextAttachments.length === 0)) {
        return NextResponse.json(
            { error: "Post content or attachments are required" },
            { status: 400 }
        );
    }

    updates.content = nextContent;
    if (nextAttachments !== null) {
        updates.attachments = nextAttachments;
    } else {
        (updates as any).attachments = null;
    }

    const updatedPost = await prisma.post.update({
        where: {
            id: post.id,
        },
        data: updates,
        select: {
            id: true,
            content: true,
            attachments: true,
            pinned: true,
            readOnly: true,
            isHidden: true,
            isDeleted: true,
            createdAt: true,
            updatedAt: true,
            authorId: true,
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
            replies: {
                where: {
                    isHidden: false,
                    isDeleted: false,
                },
                orderBy: {
                    createdAt: "desc",
                },
                take: 5,
                select: {
                    id: true,
                    content: true,
                    createdAt: true,
                    isHidden: true,
                    isDeleted: true,
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
            },
        },
    });

    // Log to Discord
    const stringifyField = (value: unknown) => {
        if (value === undefined || value === null) {
            return "(none)";
        }

        const text = typeof value === "string" ? value : JSON.stringify(value, null, 2);
        return text.length > 900 ? `${text.slice(0, 900)}...` : text;
    };

    const changeFields = Object.entries(updates)
        .filter(([key]) => key !== "content" && key !== "attachments")
        .map(([key, value]) => ({
            name: key.charAt(0).toUpperCase() + key.slice(1),
            value: String(value === null ? "(cleared)" : value),
            inline: true,
        }));

    if (changeFields.length > 0 || updates.content !== post.content || updates.attachments !== post.attachments) {
        const discord = new Discord();
        const authorName = updatedPost.author?.name || "Unknown";
        const authorHandle = updatedPost.author?.handle || "unknown";
        const description = `Post by **${authorName}** (@${authorHandle})\n[View Post](https://quacky.linus.my/post/${updatedPost.id})`;

        discord.send({
            embeds: [
                {
                    title: "Post Modified",
                    description,
                    color: 0x9b59b6,
                    fields: [
                        { name: "Post ID", value: updatedPost.id, inline: true },
                        { name: "Modified by", value: session.user.email || "Unknown", inline: true },
                        { name: "Content", value: stringifyField(updatedPost.content), inline: false },
                        { name: "Attachments", value: stringifyField(updatedPost.attachments), inline: false },
                        { name: "Pinned", value: String(updatedPost.pinned), inline: true },
                        { name: "Read Only", value: String(updatedPost.readOnly), inline: true },
                        { name: "Hidden", value: String(updatedPost.isHidden), inline: true },
                        { name: "Deleted", value: String(updatedPost.isDeleted), inline: true },
                        ...changeFields,
                    ],
                    timestamp: new Date().toISOString(),
                },
            ],
        });
    }

    return NextResponse.json(
        {
            post: {
                ...updatedPost,
                likeCount: updatedPost._count.likes,
                replyCount: updatedPost._count.replies,
                recentReplies: updatedPost.replies,
            },
        },
        { status: 200 }
    );
}
