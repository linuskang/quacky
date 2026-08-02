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

import { chat } from "@/server/helpers"
import { Fuzzy as FuzzyServer } from "@/server/fuzzy"
import { getUserById } from "@/server/users"

import { Up } from "@/server/upstream"

import { Response } from "@/lib/responses"

// Types
type Fuzzy = {
    message: string
    receiverId: string
}

export async function GET() {
    const session = await getSession()

    if (!session) {
        return Response.Unauthorized()
    }

    const fuzzies = await prisma.fuzzy.findMany({
        where: {
            receiverId: session.user.id,
        },
        orderBy: {
            createdAt: "desc",
        },
    })

    await FuzzyServer.markAllAsRead(session.user.id)

    return NextResponse.json(fuzzies)
}

export async function POST(req: NextRequest) {
    const session = await getSession()

    if (!session) {
        return Response.Unauthorized()
    }

    if (!session.user.unlockedFuzzies) {
        return Response.Forbidden(
            "This feature is locked, please complete the Warm Fuzzies Quiz to unlock it."
        )
    }

    const body = (await req.json()) as Fuzzy

    if (!body.message || !body.receiverId) {
        return Response.BadRequest("Missing: message, recieverId")
    }

    const receiver = await getUserById(body.receiverId)

    if (!receiver) {
        return Response.NotFound()
    }

    // for warm fuzzies, im currently automatically parsing each fuzzy into ai
    // for inappropriateness.
    // this will be changed in the future (student privacy), however,
    // i dont feel its good for students to be able to recieve potentially harmful
    // anonymous messages (fuzzies).
    const output = await chat([
        {
            role: "system",
            content: `
You are a content moderation system for Quacky.

Determine whether a warm fuzzy violates Quacky's rules.

A warm fuzzy is inappropriate if it contains or promotes:
- hate speech
- threats or encouragement of violence
- harassment or targeted bullying
- explicit sexual content
- spam, scams, or impersonation
- encouragement of self-harm
- private personal information (doxxing)
- usernames or profile text designed primarily to abuse or evade moderation
- any other content that is deemed inappropriate to all ages.

Return ONLY valid JSON.

{
  "is_inappropriate": boolean,
  "reason": string
}

If the post is acceptable, return:

{
  "is_inappropriate": false,
  "reason": ""
}
            `,
        },
        {
            role: "user",
            content: `
The following was said in the user's warm fuzzy: "${body.message}".
            `,
        },
    ])

    const result = JSON.parse(output)
    let flagged = false

    // log to staff for review
    if (result.is_inappropriate) {
        // in my other automated moderation steps,
        // i notify the user via. notifications,
        // however because of anonymousity, i wont here.
        flagged = true
        await Up.ingest({
            title: "AI Flagged an inappropriate warm fuzzy",
            icon: "🚨",
            description: `${session.user.name} (${session.user.id}) sent a warm fuzzy that was flagged by the AI as inappropriate. It has been hidden from the recipient.`,
            fields: [
                {
                    title: "Reason",
                    value: result.reason,
                },
                {
                    title: "Warm Fuzzy Content",
                    value: body.message,
                },
                {
                    title: "Offender",
                    value: session.user.id,
                },
                {
                    title: "Original recipient",
                    value: body.receiverId,
                },
            ],
            actions: [
                {
                    title: "View Reported Sender",
                    variant: "primary",
                    url: `${process.env.BETTER_AUTH_URL}/@${session.user.username}`,
                },
            ],
        })
    }

    // create the fuzzy.
    await prisma.fuzzy.create({
        data: {
            message: body.message,
            authorId: session.user.id,
            flagged: flagged,
            receiverId: receiver.id,
        },
    })

    return Response.Success()
}
