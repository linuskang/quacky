import { getSession } from "@/server/auth"
import { prisma } from "@/server/prisma"
import { NextRequest, NextResponse } from "next/server"
import { Up } from "@/server/upstream"
import { env } from "@/env"

export async function POST(
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
    const body = await request.json() as {
        reason: string
    }

    if (!body.reason || body.reason.trim() === "") {
        return NextResponse.json(
            { error: "Reason is required" },
            { status: 400 }
        )
    }

    const meme = await prisma.memeland.findFirst({
        where: {
            id,
            flagged: false,
        },
        include: {
            author: true
        }
    })

    if (!meme) {
        return NextResponse.json(
            { error: "Meme not found" },
            { status: 404 }
        )
    }

    await Up.ingest({
        title: "Meme reported by " + session.user.username,
        icon: "🙆",
        content: "Reported for: " + body.reason,
        fields: [
            {
                name: "Meme ID",
                value: id,
            },
            {
                name: "Meme Img",
                value: `${env.BETTER_AUTH_URL}/memes/${id}`,
            },
            {
                name: "Reported by",
                value: session.user.username,
            },
            {
                name: "Offender ID",
                value: meme.id,
            }
        ],
        actions: [
            {
                title: "View Meme",
                type: "default",
                url: `${env.BETTER_AUTH_URL}/memes/${id}`,
            },
            {
                title: "View Offender",
                type: "secondary",
                url: `${env.BETTER_AUTH_URL}/@${meme.author.username}`,
            }
        ]
    })

    return NextResponse.json({ ok: true })
}
