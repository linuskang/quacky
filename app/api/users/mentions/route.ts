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

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/server/auth"
import { prisma } from "@/server/prisma"

export async function GET(req: NextRequest) {
    const session = await auth.api.getSession({
        headers: req.headers,
    })

    if (!session) {
        return NextResponse.json(
            {
                err: "Unauthorized",
            },
            {
                status: 401,
            }
        )
    }

    const query = req.nextUrl.searchParams.get("q")?.trim() ?? ""

    const users = await prisma.user.findMany({
        where: {
            username: {
                contains: query,
                mode: "insensitive",
            },
            banned: false,
        },
        select: {
            id: true,
            name: true,
            username: true,
            image: true,
            verified: true,
            role: true,
        },
        orderBy: {
            username: "asc",
        },
        take: 8,
    })

    return NextResponse.json({ users })
}
