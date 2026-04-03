// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db";
import { auth } from "@/server/auth";

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ handle: string }> }
) {
    const session = await auth.api.getSession(request);
    const params = await context.params;

    if (!session) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    const user = await prisma.user.findFirst({
        where: {
            handle: params.handle,
        },
        select: {
            id: true,
            name: true,
            handle: true,
            bio: true,
            image: true,
            verified: true,
            privateAccount: true,
            createdAt: true,
            followers: {
                select: {
                    follower: {
                        select: {
                            handle: true,
                        }
                    }

                }
            },
            following: {
                select: {
                    following: {
                        select: {
                            handle: true,
                        }
                    }
                }
            },
            banned: true,
            role: true,
        }
    });

    if (!user) {
        return NextResponse.json(
            { error: "User not found" },
            { status: 404 }
        );
    }

    const posts = await prisma.post.findMany({
        where: {
            authorId: user.id,
            isHidden: false,
            isDeleted: false,
        },
        select: {
            id: true,
            content: true,
            createdAt: true,
            attachments: true,
            readOnly: true,
            author: {
                select: {
                    id: true,
                    name: true,
                    handle: true,
                    image: true,
                    verified: true,
                }
            }
        }
    });

    if (user.banned) {
        return NextResponse.json(
            {
                user: {
                    banned: user.banned,
                    name: user.name,
                    handle: user.handle,
                    createdAt: user.createdAt,
                },
                posts: [],
            },
            { status: 200 }
        );
    }

    if (user.privateAccount) {
        return NextResponse.json(
            {
                user: {
                    id: user.id,
                    name: user.name,
                    handle: user.handle,
                    image: user.image,
                    verified: user.verified,
                    privateAccount: user.privateAccount,
                    createdAt: user.createdAt,
                    followers: user.followers.length,
                    following: user.following.length,
                    banned: user.banned,
                    role: user.role,
                    posts: posts.length,
                },
                posts: [],
            },
            { status: 200 }
        );
    }

    return NextResponse.json(
        {
            user: {
                id: user.id,
                name: user.name,
                handle: user.handle,
                bio: user.bio,
                image: user.image,
                verified: user.verified,
                privateAccount: user.privateAccount,
                createdAt: user.createdAt,
                followers: user.followers.length,
                following: user.following.length,
                banned: user.banned,
                role: user.role,
                posts: posts.length,
            },
            posts: posts,
        },
        { status: 200 }
    );
}
