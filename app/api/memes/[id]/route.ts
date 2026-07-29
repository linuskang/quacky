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
import { NextRequest, NextResponse } from "next/server"

// Utilities
import { getSession } from "@/server/auth"
import { prisma } from "@/server/prisma"

import { Response } from "@/lib/responses"

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getSession()

    if (!session) {
        return Response.Unauthorized()
    }

    const { id } = await params

    const meme = await prisma.memeland.findFirst({
        where: {
            id,
            flagged: false,
        },
        include: {
            author: {
                select: {
                    id: true,
                    username: true,
                    image: true,
                    name: true,
                    verified: true,
                },
            },
            votes: {
                where: {
                    userId: session.user.id,
                },
                select: {
                    type: true,
                },
                take: 1,
            },
        },
    })

    if (!meme) {
        return Response.NotFound()
    }

    const [upvotes, downvotes] = await prisma.$transaction([
        prisma.memeVote.count({
            where: {
                memeId: id,
                type: "UPVOTE",
            },
        }),
        prisma.memeVote.count({
            where: {
                memeId: id,
                type: "DOWNVOTE",
            },
        }),
    ])

    const { votes, ...memeData } = meme

    return Response.Success({
        ...memeData,
        upvotes,
        downvotes,
        score: upvotes - downvotes,
        me: votes[0]?.type ?? null,
    })
}