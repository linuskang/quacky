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

import { prisma } from "@/server/prisma"
import { getSession } from "@/server/auth"
import { NextRequest, NextResponse } from "next/server"
import { getPublicObjectUrl } from "@/server/storage"

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getSession()

    if (!session) {
        return NextResponse.json({ err: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const short = await prisma.short.findUnique({
        where: { id },
        select: {
            id: true,
            description: true,
            url: true,
            flagged: true,
            createdAt: true,
            user: {
                select: {
                    id: true,
                    username: true,
                    name: true,
                    image: true,
                },
            },
        },
    })

    if (!short) {
        return NextResponse.json({ err: "Short not found" }, { status: 404 })
    }

    return NextResponse.json({
        id: short.id,
        description: short.description,
        url: getPublicObjectUrl(short.url),
        flagged: short.flagged,
        createdAt: short.createdAt.toISOString(),
        user: short.user,
    })
}
