import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db";
import { auth } from "@/server/auth";

interface ConversationPayload {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    lastMessageAt: Date | null;
    unreadCount: number;
    participant: {
        id: string;
        name: string;
        handle: string;
        image: string | null;
        verified: boolean;
    } | null;
    lastMessage: {
        id: string;
        content: string;
        createdAt: Date;
        senderId: string;
    } | null;
}

export async function GET(request: NextRequest) {
    const session = await auth.api.getSession(request);

    if (!session) {
        return NextResponse.json(
            { success: false, error: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        const conversations = await prisma.dMConversation.findMany({
            where: {
                participants: {
                    some: {
                        userId: session.user.id,
                    },
                },
            },
            include: {
                participants: {
                    include: {
                        user: {
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
                messages: {
                    orderBy: {
                        createdAt: "desc",
                    },
                    take: 1,
                    select: {
                        id: true,
                        content: true,
                        createdAt: true,
                        senderId: true,
                    },
                },
            },
            orderBy: [
                { lastMessageAt: "desc" },
                { updatedAt: "desc" },
            ],
        });

        const formatted = await Promise.all(conversations.map(async (conversation) => {
            const me = conversation.participants.find((participant) => participant.userId === session.user.id);
            const other = conversation.participants.find((participant) => participant.userId !== session.user.id);

            const unreadCount = await prisma.dMMessage.count({
                where: {
                    conversationId: conversation.id,
                    senderId: {
                        not: session.user.id,
                    },
                    ...(me?.lastReadAt
                        ? {
                            createdAt: {
                                gt: me.lastReadAt,
                            },
                        }
                        : {}),
                },
            });

            const payload: ConversationPayload = {
                id: conversation.id,
                createdAt: conversation.createdAt,
                updatedAt: conversation.updatedAt,
                lastMessageAt: conversation.lastMessageAt,
                unreadCount,
                participant: other
                    ? {
                        id: other.user.id,
                        name: other.user.name,
                        handle: other.user.handle,
                        image: other.user.image,
                        verified: other.user.verified,
                    }
                    : null,
                lastMessage: conversation.messages[0]
                    ? {
                        id: conversation.messages[0].id,
                        content: conversation.messages[0].content,
                        createdAt: conversation.messages[0].createdAt,
                        senderId: conversation.messages[0].senderId,
                    }
                    : null,
            };

            return payload;
        }));

        return NextResponse.json(
            {
                success: true,
                conversations: formatted,
            },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
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
        const targetUserId = typeof body.targetUserId === "string" ? body.targetUserId : null;
        const targetHandle = typeof body.targetHandle === "string" ? body.targetHandle.trim() : null;

        if (!targetUserId && !targetHandle) {
            return NextResponse.json(
                { success: false, error: "Target user is required" },
                { status: 400 }
            );
        }

        const target = await prisma.user.findFirst({
            where: {
                OR: [
                    ...(targetUserId ? [{ id: targetUserId }] : []),
                    ...(targetHandle ? [{ handle: targetHandle }] : []),
                ],
            },
            select: {
                id: true,
                name: true,
                handle: true,
                image: true,
                verified: true,
                banned: true,
            },
        });

        if (!target || target.banned) {
            return NextResponse.json(
                { success: false, error: "User not found" },
                { status: 404 }
            );
        }

        if (target.id === session.user.id) {
            return NextResponse.json(
                { success: false, error: "You cannot message yourself" },
                { status: 400 }
            );
        }

        const existingCandidates = await prisma.dMConversation.findMany({
            where: {
                participants: {
                    some: {
                        userId: session.user.id,
                    },
                },
                AND: {
                    participants: {
                        some: {
                            userId: target.id,
                        },
                    },
                },
            },
            include: {
                participants: true,
                messages: {
                    orderBy: {
                        createdAt: "desc",
                    },
                    take: 1,
                },
            },
            orderBy: {
                updatedAt: "desc",
            },
        });

        const existing = existingCandidates.find((conversation) => conversation.participants.length === 2);

        if (existing) {
            return NextResponse.json(
                {
                    success: true,
                    conversation: {
                        id: existing.id,
                        participant: {
                            id: target.id,
                            name: target.name,
                            handle: target.handle,
                            image: target.image,
                            verified: target.verified,
                        },
                        lastMessageAt: existing.lastMessageAt,
                    },
                },
                { status: 200 }
            );
        }

        const conversation = await prisma.dMConversation.create({
            data: {
                participants: {
                    create: [
                        {
                            userId: session.user.id,
                            lastReadAt: new Date(),
                        },
                        {
                            userId: target.id,
                        },
                    ],
                },
            },
            select: {
                id: true,
                createdAt: true,
                updatedAt: true,
                lastMessageAt: true,
            },
        });

        return NextResponse.json(
            {
                success: true,
                conversation: {
                    ...conversation,
                    participant: {
                        id: target.id,
                        name: target.name,
                        handle: target.handle,
                        image: target.image,
                        verified: target.verified,
                    },
                },
            },
            { status: 201 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
