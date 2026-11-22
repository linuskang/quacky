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

    const scales = [body?.usability, body?.satisfaction, body?.recommend, body?.visual]

    if (
        !body ||
        scales.some((s) => !Number.isInteger(s) || s < 1 || s > 5) ||
        typeof body.comments !== "string" ||
        !body.comments.trim()
    ) {
        return Response.BadRequest("Missing or invalid required fields.")
    }

    // log feedback
    await Up.ingest({
        title: `Feedback submitted from ${session.user.name} (${session.user.email})`,
        icon: "📋",
        category: "feedback",
        fields: [
            {
                title: "Usability",
                value: String(body.usability),
            },
            {
                title: "Satisfaction",
                value: String(body.satisfaction),
            },
            {
                title: "Recommend",
                value: String(body.recommend),
            },
            {
                title: "Visual",
                value: String(body.visual),
            },
        ],
        description: body.comments,
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

    return Response.Success("Feedback submitted, thanks!")
}
