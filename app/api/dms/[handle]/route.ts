//   ______                                 __
//  /      \                               /  |
// /$$$$$$  | __    __   ______    _______ $$ |   __  __    __
// $$ |  $$ |/  |  /  | /      \  /       |$$ |  /  |/  |  /  |
// $$ |  $$ |$$ |  $$ | $$$$$$  |/$$$$$$$/ $$ |_/$$/ $$ |  $$ |
// $$ |_ $$ |$$ |  $$ | /    $$ |$$ |      $$   $$<  $$ |  $$ |
// $$ / \$$ |$$ \__$$ |/$$$$$$$ |$$ \_____ $$$$$$  \ $$ \__$$ |
// $$ $$ $$< $$    $$/ $$    $$ |$$       |$$ | $$  |$$    $$ |
//  $$$$$$  | $$$$$$/   $$$$$$$/  $$$$$$$/ $$/   $$/  $$$$$$$ |
//      $$$/                                         /  \__$$ |
//                                                   $$    $$/
//                                                    $$$$$$/
//
// Linus Kang, 2026
// Work is licensed under the CC BY-NC 4.0 license.

// Libraries
import { NextRequest } from "next/server"

// Utilities
import { prisma } from "@/server/prisma"
import { getSession } from "@/server/auth"
import { fetchMessages } from "@/server/dms"

import { Response } from "@/lib/responses"

// GET messages between the current user and the user identified by `handle`.
export async function GET(
    _req: NextRequest,
    { params }: {
        params: Promise<{
            handle: string
        }>
    }
) {
    const session = await getSession()

    if (!session) {
        return Response.Unauthorized()
    }

    const { handle } = await params

    const other = await prisma.user.findUnique({
        where: { username: handle },
        select: { id: true },
    })

    if (!other) {
        return Response.NotFound(
            "User not found"
        )
    }

    if (other.id === session.user.id) {
        return Response.BadRequest(
            "You can't message yourself"
        )
    }

    const messages = await fetchMessages({
        userId: session.user.id,
        otherUserId: other.id,
    })

    return Response.Success(messages)
}

export interface DmBody {
    message: string
}

export async function POST(
    req: NextRequest,
    { params }: {
        params: Promise<{
            handle: string
        }>
    }
) {
    const session = await getSession()

    if (!session) {
        return Response.Unauthorized()
    }

    const { handle } = await params

    const other = await prisma.user.findUnique({
        where: { username: handle },
        select: {
            id: true,
            name: true,
            username: true,
            image: true,
            verified: true,
            role: true,
        },
    })

    if (!other) {
        return Response.NotFound("User not found")
    }

    if (other.id === session.user.id) {
        return Response.BadRequest(
            "You can't message yourself"
        )
    }

    const body = (await req.json()) as DmBody

    if (!body.message) {
        return Response.BadRequest(
            "message is required."
        )
    }

    const message = body.message.trim()

    if (message.length === 0 || message.length > 1000) {
        return Response.BadRequest(
            "message must be between 1 and 1000 characters."
        )
    }

    // create dm msg
    const dm = await prisma.dm.create({
        data: {
            senderId: session.user.id,
            receiverId: other.id,
            message,
        },
        include: {
            sender: {
                select: {
                    id: true,
                    name: true,
                    username: true,
                    image: true,
                    verified: true,
                    role: true,
                },
            },
            receiver: {
                select: {
                    id: true,
                    name: true,
                    username: true,
                    image: true,
                    verified: true,
                    role: true,
                },
            },
        },
    })

    return Response.Success({
        id: dm.id,
        sender: dm.sender,
        receiver: dm.receiver,
        message: dm.message,
        read: dm.read,
        createdAt: dm.createdAt.toISOString(),
    })
}
