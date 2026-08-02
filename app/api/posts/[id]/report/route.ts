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

import { prisma } from "@/server/prisma"
import { getSession } from "@/server/auth"
import { NextRequest, NextResponse } from "next/server"
import { Up } from "@/server/upstream"
import { env } from "@/env"
import { NotificationService } from "@/server/helpers"
import { getPost } from "@/server/posts"
import { Admin } from "@/server/administration"
import { chat } from "@/server/helpers"
import { xp } from "@/lib/var"
import { addXP } from "@/server/users"

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getSession()

    if (!session) {
        return new NextResponse("Unauthorized", {
            status: 401,
        })
    }

    const { id } = await params

    const post = await getPost(id, session)

    if (!post) {
        return new NextResponse("Post not found", {
            status: 404,
        })
    }

    const body = await req.json()

    if (!body.reason) {
        return new NextResponse("Reason is required", {
            status: 400,
        })
    }

    const output = await chat([
        {
            role: "system",
            content: `
You are a content moderation system for Quacky.

Determine whether a user post violates Quacky's rules.

A post is inappropriate if it contains or promotes:
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
Post content: ${post.content}
Author: ${post.author}

Reporter's reason:
${body.reason}
`,
        },
    ])

    const result = JSON.parse(output)

    if (result.is_inappropriate) {
        await Admin.flagPost(post.id)
        await NotificationService.send(
            post.authorId,
            "quacky",
            `Hello, ${post.author.name}. \n\nYour [post](${env.BETTER_AUTH_URL}/post/${post.id}) which you made on **${new Date().toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}** has been taken down due to a violation of our [Community Guidelines](https://quacky.space/terms).\n\nReason given: **${result.reason}**\n\nIf you believe this is a mistake, please contact an school administrator.`
        )
    }

    await addXP(session.user.username, xp.report)

    await Up.ingest({
        title: "Post Report - " + post.id,
        icon: "🚩",
        description: `A new report has been submitted for post ${post.id}. Reason: ${body.reason}`,
        fields: [
            {
                title: "Author Username",
                value: post.author.username,
            },
            {
                title: "Author ID",
                value: post.authorId,
            },
            {
                title: "Auto Flagged?",
                value: result.is_inappropriate ? "Yes" : "No",
            },
            {
                title: "AI Reason",
                value: result.reason,
            },
        ],
        data: {
            offender: post,
            reportReason: body.reason,
            ai: {
                isInappropriate: result.is_inappropriate,
                reason: result.reason,
            },
        },
        actions: [
            {
                title: "View Post",
                variant: "primary",
                url: `https://quacky.space/post/${post.id}`,
            },
        ],
    })

    return NextResponse.json(
        {
            success: true,
            message: "Report submitted successfully",
        },
        {
            status: 200,
        }
    )
}
