import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db";
import { auth } from "@/server/auth";

async function canAccessConversation(conversationId: string, userId: string) {
    const participant = await prisma.dMParticipant.findUnique({
        where: {
            conversationId_userId: {
                conversationId,
                userId,
            },
        },
        select: {
            conversationId: true,
            lastReadAt: true,
        },
    });

    return participant;
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth.api.getSession(request);

    if (!session) {
        return NextResponse.json(
            { success: false, error: "Unauthorized" },
            { status: 401 }
        );
    }

    const conversationId = (await params).id;

    try {
        const membership = await canAccessConversation(conversationId, session.user.id);

        if (!membership) {
            return NextResponse.json(
                { success: false, error: "Conversation not found" },
                { status: 404 }
            );
        }

        const conversation = await prisma.dMConversation.findUnique({
            where: {
                id: conversationId,
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
                    where: {
                        deleted: false,
                    },
                    orderBy: {
                        createdAt: "asc",
                    },
                    select: {
                        id: true,
                        content: true,
                        createdAt: true,
                        updatedAt: true,
                        senderId: true,
                        sender: {
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

        if (!conversation) {
            return NextResponse.json(
                { success: false, error: "Conversation not found" },
                { status: 404 }
            );
        }

        const participant = conversation.participants.find((entry) => entry.userId !== session.user.id);

        return NextResponse.json(
            {
                success: true,
                conversation: {
                    id: conversation.id,
                    createdAt: conversation.createdAt,
                    updatedAt: conversation.updatedAt,
                    lastMessageAt: conversation.lastMessageAt,
                    participant: participant
                        ? {
                            id: participant.user.id,
                            name: participant.user.name,
                            handle: participant.user.handle,
                            image: participant.user.image,
                            verified: participant.user.verified,
                        }
                        : null,
                    messages: conversation.messages,
                },
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

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth.api.getSession(request);

    if (!session) {
        return NextResponse.json(
            { success: false, error: "Unauthorized" },
            { status: 401 }
        );
    }

    const conversationId = (await params).id;

    try {
        const membership = await canAccessConversation(conversationId, session.user.id);

        if (!membership) {
            return NextResponse.json(
                { success: false, error: "Conversation not found" },
                { status: 404 }
            );
        }

        const body = await request.json();
        const content = typeof body.content === "string" ? body.content.trim() : "";

        if (!content || content.length > 1000) {
            return NextResponse.json(
                { success: false, error: "Message is invalid" },
                { status: 400 }
            );
        }

        const now = new Date();

        const result = await prisma.$transaction(async (tx) => {
            const message = await tx.dMMessage.create({
                data: {
                    conversationId,
                    senderId: session.user.id,
                    content,
                },
                select: {
                    id: true,
                    content: true,
                    createdAt: true,
                    updatedAt: true,
                    senderId: true,
                    sender: {
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

            await tx.dMConversation.update({
                where: {
                    id: conversationId,
                },
                data: {
                    lastMessageAt: now,
                },
            });

            await tx.dMParticipant.update({
                where: {
                    conversationId_userId: {
                        conversationId,
                        userId: session.user.id,
                    },
                },
                data: {
                    lastReadAt: now,
                },
            });

            return message;
        });

        return NextResponse.json(
            {
                success: true,
                message: result,
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
