import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db";
import { auth } from "@/server/auth";

export async function PATCH(
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
        const existing = await prisma.dMParticipant.findUnique({
            where: {
                conversationId_userId: {
                    conversationId,
                    userId: session.user.id,
                },
            },
            select: {
                conversationId: true,
            },
        });

        if (!existing) {
            return NextResponse.json(
                { success: false, error: "Conversation not found" },
                { status: 404 }
            );
        }

        const participant = await prisma.dMParticipant.update({
            where: {
                conversationId_userId: {
                    conversationId,
                    userId: session.user.id,
                },
            },
            data: {
                lastReadAt: new Date(),
            },
            select: {
                conversationId: true,
                lastReadAt: true,
            },
        });

        return NextResponse.json(
            {
                success: true,
                participant,
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
