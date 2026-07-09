import { getSession } from "@/server/auth"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/server/prisma"
import { chat } from "@/server/helpers"
import { Up } from "@/server/upstream"
import { getUserById } from "@/server/users"

type Fuzzy = {
    message: string
    receiverId: string
}

export async function POST(req: NextRequest) {
    const session = await getSession()

    if (!session) {
        return new NextResponse(
            "Unauthorised",
            {
                status: 401
            }
        )
    }

    if (!session.user.unlockedFuzzies) {
        return new NextResponse(
            "This feature is locked, please complete the Warm Fuzzies Quiz to unlock it.",
            {
                status: 403
            }
        )
    }


    const body = await req.json() as Fuzzy

    if (!body.message || !body.receiverId) {
        return new NextResponse(
            "Missing required fields",
            {
                status: 400
            }
        )
    }

    const receiver = await getUserById(body.receiverId)

    if (!receiver) {
        return new NextResponse(
            "User not found",
            {
                status: 404
            }
        )
    }

    const output = await chat([
        {
            role: 'system',
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
            `
        },
        {
            role: 'user',
            content: `
The following was said in the user's warm fuzzy: "${body.message}".
            `
        }
    ])

    const result = JSON.parse(output)
    let flagged = false

    if (result.is_inappropriate) {
        flagged = true
        await Up.ingest({
            title: "AI Flagged an inappropriate warm fuzzy",
            icon: "🚨",
            content: `${session.user.name} (${session.user.id}) sent a warm fuzzy that was flagged by the AI as inappropriate. It has been hidden from the recipient.`,
            fields: [
                {
                    name: "Reason",
                    value: result.reason
                },
                {
                    name: "Warm Fuzzy Content",
                    value: body.message
                },
                {
                    name: "Offender",
                    value: session.user.id
                },
                {
                    name: "Original recipient",
                    value: body.receiverId
                }
            ],
            actions: [
                {
                    title: "View Reported Sender",
                    type: "default",
                    url: `${process.env.BETTER_AUTH_URL}/@${session.user.username}`
                }
            ]
        })
    }

    await prisma.fuzzy.create({
        data: {
            message: body.message,
            authorId: session.user.id,
            flagged: flagged,
            receiverId: receiver.id
        }
    })

    return NextResponse.json({
        success: true,
    }, { status: 201 }
    )
}