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

import { Up } from "@/server/upstream"

import { Response } from "@/lib/responses"

export async function POST(req: NextRequest) {
    const session = await getSession()

    if (!session) {
        return Response.Unauthorized()
    }

    const body = await req.json()

    if (
        !body ||
        !body.usability ||
        !body.satisfaction ||
        !body.recommend ||
        !body.visual ||
        !body.comments
    ) {
        return Response.BadRequest("Missing required fields.")
    }

    // log feedback
    await Up.ingest({
        title: `Feedback submitted from ${session.user.name} (${session.user.email})`,
        icon: "📋",
        category: "feedback",
        fields: [
            {
                name: "Usability",
                value: String(body.usability),
            },
            {
                name: "Satisfaction",
                value: String(body.satisfaction),
            },
            {
                name: "Recommend",
                value: String(body.recommend),
            },
            {
                name: "Visual",
                value: String(body.visual),
            },
        ],
        content: body.comments,
        data: [
            body,
            {
                user: {
                    name: session.user.name,
                    email: session.user.email,
                    id: session.user.id,
                },
            },
        ],
    })

    return Response.Success(
        "Feedback submitted, thanks!"
    )
}
