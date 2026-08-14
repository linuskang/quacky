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

import { auth } from "@/server/auth"
import { NotificationService } from "@/server/helpers"
import { prisma } from "@/server/prisma"
import { NextRequest } from "next/server"
import { follow, unfollow } from "@/server/follow"
import { Response } from "@/lib/responses"

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ handle: string }> }
) {
    const session = await auth.api.getSession({
        headers: req.headers,
    })

    if (!session) {
        return Response.Unauthorized()
    }

    const { handle } = await params
    const user = await prisma.user.findUnique({
        where: { username: handle },
        select: { id: true },
    })

    if (!user) {
        return Response.NotFound()
    }

    if (user.id === session.user.id) {
        return Response.BadRequest("Cannot follwo self")
    }

    await follow(session.user.id, user.id)

    return Response.Success()
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ handle: string }> }
) {
    const session = await auth.api.getSession({
        headers: req.headers,
    })

    if (!session) {
        return Response.Unauthorized()
    }

    const { handle } = await params
    const user = await prisma.user.findUnique({
        where: { username: handle },
        select: { id: true },
    })

    if (!user) {
        return Response.NotFound()
    }

    await unfollow(session.user.id, user.id)

    return Response.Success()
}
