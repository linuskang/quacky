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
import { getCheckInSummary, hasCheckedIn } from "@/server/check-in"
import { NextResponse } from "next/server"
import { prisma } from "@/server/prisma"
import { Fuzzy } from "@/server/fuzzy"

export async function GET() {
    const session = await getSession()

    if (!session) {
        return new NextResponse("Unauthorized", {
            status: 401,
        })
    }

    const [
        hasCheckedInToday,
        streak,
        unreadNotifications,
        unreadDms,
        unreadFuzzies,
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
        return new NextResponse("User not found", {
            status: 404,
        })
    }

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
        },
        {
            status: 200,
        }
    )
}
