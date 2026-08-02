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
import { NextRequest } from "next/server"

// Utilities
import { getSession } from "@/server/auth"
import { sendPushNotification } from "@/server/notification"
import { prisma } from "@/server/prisma"
import { env } from "@/env"

import { Response } from "@/lib/responses"

export async function GET(req: NextRequest) {
    const session = await getSession()
    const apiKey = req.headers.get("x-api-key")

    const isAuthorized =
        (session && session.user.role === "admin") ||
        (apiKey !== null && apiKey === env.UPSTREAM_API_KEY)

    if (!isAuthorized) {
        return Response.Forbidden()
    }

    const username = session?.user.username ?? env.TEST_PUSH_USERNAME

    if (!username) {
        return Response.BadRequest(
            "No target user. Log in as admin or set TEST_PUSH_USERNAME"
        )
    }

    const user = await prisma.user.findUnique({
        where: { username },
        select: { id: true },
    })

    if (!user) {
        return Response.NotFound("User not found")
    }

    const result = await sendPushNotification(user.id, {
        title: "Quacky",
        body: "Test push from Quacky! Push notifications are working.",
    })

    if (!result.success) {
        return Response.InternalServerError(result.error)
    }

    return Response.Success({
        sent: result.sent,
        username,
    })
}
