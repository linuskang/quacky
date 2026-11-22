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
import { NextResponse } from "next/server"

// Utilities
import { getSession } from "@/server/auth"
import { getCheckInSummary, hasCheckedIn } from "@/server/check-in"
import { prisma } from "@/server/prisma"

import { Response } from "@/lib/responses"

export async function GET() {
    const session = await getSession()

    if (!session) {
        return Response.Unauthorized()
    }

    const [
        hasCheckedInToday,
        streak,
        unreadNotifications,
        unreadDms,
        unreadFuzzies,
        balance,
    ] = await Promise.all([
        hasCheckedIn(session.user.id),
        getCheckInSummary(session.user.id),
        prisma.notification.count({
            where: {
                userId: session.user.id,
                read: false,
            },
        }),
        prisma.dm.count({
            where: {
                receiverId: session.user.id,
                read: false,
            },
        }),
        prisma.fuzzy.count({
            where: {
                receiverId: session.user.id,
                read: false,
            },
        }),
        prisma.user.findUnique({
            where: {
                id: session.user.id,
            },
            select: {
                points: true,
            }
        })
    ])

    const user = await prisma.user.findUnique({
        where: {
            id: session.user.id,
        },
        select: {
            unlockedPosting: true,
            unlockedCommenting: true,
        },
    })

    // type checking is weird man....
    // already declared that if the session isnt valid above
    // then return 401 but typescript is like "nah bro what if it is still null"
    // talk about redundant....
    if (!user) {
        return Response.NotFound()
    }

    // i wont use Response.Success() because a bunch of components are using this endpoint and
    // i dont feel like adjusting schemas.
    return NextResponse.json(
        {
            hasCheckedIn: hasCheckedInToday,
            canPost: user.unlockedPosting,
            canComment: user.unlockedCommenting,
            unreads: {
                notifications: unreadNotifications,
                dms: unreadDms,
                fuzzies: unreadFuzzies,
            },
            streak,
            balance: balance?.points
        },
        {
            status: 200,
        }
    )
}
