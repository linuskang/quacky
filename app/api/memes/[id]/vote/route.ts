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

// Utilities
import { getSession } from "@/server/auth"
import { prisma } from "@/server/prisma"

import { Response } from "@/lib/responses"

// Types
type VoteBody = {
    type: "UPVOTE" | "DOWNVOTE"
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getSession()

    if (!session) {
        return Response.Unauthorized()
    }

    const { id: memeId } = await params

    let body: VoteBody

    try {
        body = await request.json()
    } catch {
        return Response.BadRequest("Invalid JSON body")
    }

    if (body.type !== "UPVOTE" && body.type !== "DOWNVOTE") {
        return Response.BadRequest("Vote type must be UPVOTE or DOWNVOTE")
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
        return Response.NotFound()
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
    return Response.Success({
        vote: vote.type,
        upvotes,
        downvotes,
        score: upvotes - downvotes,
    })
}