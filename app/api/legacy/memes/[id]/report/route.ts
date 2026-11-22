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
import { getSession } from "@/server/auth"
import { prisma } from "@/server/prisma"

import { Up } from "@/server/upstream"

import { env } from "@/env"

import { Response } from "@/lib/responses"

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getSession()

    if (!session) {
        return Response.Unauthorized()
    }

    const { id } = await params
    const body = (await request.json()) as {
        reason: string
    }

    if (!body.reason || body.reason.trim() === "") {
        return Response.BadRequest("reason is required")
    }

    const meme = await prisma.memeland.findFirst({
        where: {
            id,
            flagged: false,
        },
        include: {
            author: true,
        },
    })

    if (!meme) {
        return Response.NotFound()
    }

    // log report to staff.
    await Up.ingest({
        title: "Meme reported by " + session.user.username,
        icon: "🙆",
        description: "Reported for: " + body.reason,
        fields: [
            {
                title: "Meme ID",
                value: id,
            },
            {
                title: "Meme Img",
                value: `${env.BETTER_AUTH_URL}/memes/${id}`,
            },
            {
                title: "Reported by",
                value: session.user.username,
            },
            {
                title: "Offender ID",
                value: meme.id,
            },
        ],
        actions: [
            {
                title: "View Meme",
                variant: "primary",
                url: `${env.BETTER_AUTH_URL}/memes/${id}`,
            },
            {
                title: "View Offender",
                variant: "secondary",
                url: `${env.BETTER_AUTH_URL}/@${meme.author.username}`,
            },
        ],
    })

    return Response.Success("reported, thanks!")
}
