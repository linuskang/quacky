import { auth } from "@/server/auth";
import { NotificationService } from "@/server/helpers";
import { prisma } from "@/server/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ handle: string }> }
) {
    const session = await auth.api.getSession({
        headers: req.headers,
    });

    if (!session) {
        return NextResponse.json({ err: "Unauthorized" }, { status: 401 });
    }

    const { handle } = await params;
    const user = await prisma.user.findUnique({
        where: { username: handle },
        select: { id: true },
    });

    if (!user) {
        return NextResponse.json({ err: "User not found" }, { status: 404 });
    }

    if (user.id === session.user.id) {
        return NextResponse.json({ err: "You cannot follow yourself" }, { status: 400 });
    }

    const follow = await prisma.follow.createMany({
        data: [
            {
                userId: session.user.id,
                followId: user.id,
            },
        ],
        skipDuplicates: true,
    });

    if (follow.count === 1) {
        await NotificationService.sendFollow(user.id, session.user.id);
    }

    return NextResponse.json({ success: true, following: true });
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ handle: string }> }
) {
    const session = await auth.api.getSession({
        headers: req.headers,
    });

    if (!session) {
        return NextResponse.json({ err: "Unauthorized" }, { status: 401 });
    }

    const { handle } = await params;
    const user = await prisma.user.findUnique({
        where: { username: handle },
        select: { id: true },
    });

    if (!user) {
        return NextResponse.json({ err: "User not found" }, { status: 404 });
    }

    const follow = await prisma.follow.deleteMany({
        where: {
            userId: session.user.id,
            followId: user.id,
        },
    });

    if (follow.count === 1) {
        await NotificationService.removeFollow(user.id, session.user.id);
    }

    return NextResponse.json({ success: true, following: false });
}
