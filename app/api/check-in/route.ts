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

import {
    hasCheckedIn,
    checkIn
} from "@/server/check-in"

import { addXP } from "@/server/users"
import { Up } from "@/server/upstream"

import { env } from "@/env"
import { xp } from "@/lib/var"

import { Response } from "@/lib/responses"

export async function POST(req: NextRequest) {
    const session = await getSession()

    if (!session) {
        return Response.Unauthorized()
    }

    const hasCheckedInToday = await hasCheckedIn(session.user.id)

    if (hasCheckedInToday) {
        return Response.BadRequest(
            "You have already checked in today"
        )
    }

    // gert stuff ig
    const body = await req.json() as {
        wellbeing: number
        happiness: number
        stress: number
        sleep: number
        energy: number
        assistance: boolean
    }

    // check in (cool right)
    const res = await checkIn({
        userId: session.user.id,
        date: new Date(),
        wellbeing: body.wellbeing,
        happiness: body.happiness,
        stress: body.stress,
        sleep: body.sleep,
        energy: body.energy,
        assistance: body.assistance,
    })

    // xp.
    await addXP(session.user.username, xp.checkIn)

    // send to admins for assistance if requested.
    if (res.assistance) {
        await Up.ingest({
            title: "Student requested a talk with a staff member",
            icon: "🛫",
            fields: [
                {
                    name: "Name",
                    value: session.user.name,
                },
                {
                    name: "Email",
                    value: session.user.email,
                },
            ],
            actions: [
                {
                    title: "Send Email",
                    url: `mailto:${session.user.email}?subject=Student%20Check-In%20Assistance&body=Hello%20${session.user.name},`,
                    type: "default",
                },
                {
                    title: "View in Quacky",
                    url: `${env.BETTER_AUTH_URL}/@${session.user.username}`,
                    type: "secondary",
                },
            ],
        })
    }

    // hooray
    return Response.Success(
        "Thanks for checking in!"
    )
}
