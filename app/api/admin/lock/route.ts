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

import { Response } from "@/lib/responses"

import { Up } from "@/server/upstream"

export async function POST(req: NextRequest) {
    const sess = await getSession()
    if (!sess) {
        return Response.Unauthorized()
    }

    if (sess.user.role !== "admin") {
        return Response.Forbidden()
    }

    const body = (await req.json()) as {
        locked: boolean
    }

    // make a function here to lock functions like dms, posting, commenting, fuzzies, etc.

    await Up.ingest({
        title: "Site features restrictions updated",
        icon: body.locked ? "🔒" : "🔓",
        fields: [
            {
                name: "Locked",
                value: body.locked ? "Yes" : "No",
            },
            {
                name: "Updated by",
                value: sess.user.email,
            },
        ],
        data: {
            sess,
        },
    })

    return Response.Success({
        locked: body.locked,
    })
}
