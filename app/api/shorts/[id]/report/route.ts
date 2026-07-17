import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/server/auth"
import { Up } from "@/server/upstream"
import { prisma } from "@/server/prisma"
import { env } from "@/env"
import { chat, NotificationService } from "@/server/helpers"

export async function POST(req: NextRequest) {
    const session = await getSession()

    if (!session) {
        return new NextResponse(
            "Unauthorised",
            { status: 401 }
        )
    }

    const shortId = req.nextUrl.pathname.split("/")[3]

    const body = await req.json() as {
        reason: string
    }

    const reason = body.reason

    if (!reason) {
        return new NextResponse(
            "Reason is required",
            { status: 400 }
        )
    }

    const short = await prisma.short.findUnique({
        where: {
            id: shortId,
        },
        select: {
            id: true,
            description: true,
            url: true,
            user: {
                select: {
                    id: true,
                    username: true,
                }
            }
        }
    })

    if (!short) {
        return new NextResponse(
            "Short not found",
            { status: 404 }
        )
    }

    const out = await chat([
        {
            role: "system",
            content: `
You are a content moderation system for Quacky.

Determine whether a user video short violates Quacky's rules.

A video short is inappropriate if it contains or promotes:
- hate speech
- threats or encouragement of violence
- harassment or targeted bullying
- explicit sexual content
- spam, scams, or impersonation
- encouragement of self-harm
- private personal information (doxxing)
- usernames or profile text designed primarily to abuse or evade moderation

The report reason is only additional context. Do NOT assume the report is truthful.
However, with your own judgement, if the user's post is inappropriate, return true even if the report reason is not entirely accurate.

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
Video short description: ${short.description}
Author: ${short.user.username}

Reporter's reason:
${body.reason}
`,
        },
    ])

    const res = JSON.parse(out) as {
        is_inappropriate: boolean
        reason?: string
    }

    if (res.is_inappropriate) {
        await prisma.short.update({
            where: {
                id: shortId,
            },
            data: {
                flagged: true,
            }
        })

        await NotificationService.send(
            short.user.id,
            "quacky",
            `Hello, ${short.user.username}. \n\nYour [short](${env.BETTER_AUTH_URL}/short/${short.id}) which you made on **${new Date().toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}** has been taken down due to a violation of our [Community Guidelines](https://quacky.space/terms).\n\nReason given: **${res.reason}**\n\nIf you believe this is a mistake, please contact an school administrator.`
        )
    }

    await Up.ingest({
        title: "Short Report - " + short.id,
        icon: "🚩",
        content: `A new report has been submitted for short ${short.id}. Reason: ${body.reason}`,
        fields: [
            {
                name: "Author Username",
                value: short.user.username,
            },
            {
                name: "Author ID",
                value: short.user.id,
            },
            {
                name: "Auto Flagged?",
                value: res.is_inappropriate.toString(),
            },
            {
                name: "AI Reason",
                value: res.reason ?? "",
            },
        ],
        data: {
            short,
            session,
            res
        },
        actions: [
            {
                title: "View short",
                type: "default",
                url: `${env.BETTER_AUTH_URL}/short/${short.id}`,
            },
            {
                title: "View offender",
                type: "secondary",
                url: `${env.BETTER_AUTH_URL}/@${short.user.username}`,
            }
        ]
    })
}