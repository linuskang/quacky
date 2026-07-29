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

export async function GET() {
    const session = await getSession()

    if (!session) {
        return Response.Unauthorized()
    }

    const memes = await prisma.memeland.findMany({
        where: {
            flagged: false,
        },
        orderBy: {
            createdAt: "desc",
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

    return Response.Success(memes)
}

export async function POST(
    request: NextRequest,
) {
    const session = await getSession()

    if (!session) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        )
    }

    const res = await request.json() as {
        image: string
    }

    if (!res.image) {
        return new NextResponse(
            "Image is required",
            { status: 400 }
        )
    }

    const meme = await prisma.memeland.create({
        data: {
            imgUrl: res.image,
            authorId: session.user.id,
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
        },
    })

    return NextResponse.json({ meme })
}
