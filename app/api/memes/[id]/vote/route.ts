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

import { getSession } from "@/server/auth"
import { prisma } from "@/server/prisma"
import { NextResponse } from "next/server"

type VoteBody = {
    type: "UPVOTE" | "DOWNVOTE"
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getSession()

    if (!session) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        )
    }

    const { id: memeId } = await params

    let body: VoteBody

    try {
        body = await request.json()
    } catch {
        return NextResponse.json(
            { error: "Invalid JSON body" },
            { status: 400 }
        )
    }

    if (body.type !== "UPVOTE" && body.type !== "DOWNVOTE") {
        return NextResponse.json(
            { error: "Vote type must be UPVOTE or DOWNVOTE" },
            { status: 400 }
        )
    }

    const meme = await prisma.memeland.findFirst({
        where: {
            id: memeId,
            flagged: false,
        },
        select: {
            id: true,
        },
    })

    if (!meme) {
        return NextResponse.json(
            { error: "Meme not found" },
            { status: 404 }
        )
    }

    const vote = await prisma.memeVote.upsert({
        where: {
            memeId_userId: {
                memeId,
                userId: session.user.id,
            },
        },
        create: {
            memeId,
            userId: session.user.id,
            type: body.type,
        },
        update: {
            type: body.type,
        },
    })

    const [upvotes, downvotes] = await prisma.$transaction([
        prisma.memeVote.count({
            where: {
                memeId,
                type: "UPVOTE",
            },
        }),
        prisma.memeVote.count({
            where: {
                memeId,
                type: "DOWNVOTE",
            },
        }),
    ])

    return NextResponse.json({
        vote: vote.type,
        upvotes,
        downvotes,
        score: upvotes - downvotes,
    })
}