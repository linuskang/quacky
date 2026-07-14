import { getSession } from "@/server/auth"
import { prisma } from "@/server/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getSession()

    if (!session) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        )
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
        return NextResponse.json(
            { error: "Meme not found" },
            { status: 404 }
        )
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

    return NextResponse.json({
        ...memeData,
        upvotes,
        downvotes,
        score: upvotes - downvotes,
        me: votes[0]?.type ?? null,
    })
}