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
import { NextRequest, NextResponse } from "next/server"
import { getComment } from "@/server/comment"
import { Up } from "@/server/upstream"
import { Admin } from "@/server/administration"
import { chat } from "@/server/helpers"
import { NotificationService } from "@/server/helpers"
import { env } from "@/env"
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
  const comment = await getComment(id)

  if (!comment) {
    return new NextResponse("Comment not found", {
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

Determine whether a user's comment violates Quacky's rules.

A comment is inappropriate if it contains or promotes:
- hate speech
- threats or encouragement of violence
- harassment or targeted bullying
- explicit sexual content
- spam, scams, or impersonation
- encouragement of self-harm
- private personal information (doxxing)
- usernames or profile text designed primarily to abuse or evade moderation

The report reason is only additional context. Do NOT assume the report is truthful.
However, with your own judgement, if the user's comment is inappropriate, return true even if the report reason is not entirely accurate.

Return ONLY valid JSON.

{
  "is_inappropriate": boolean,
  "reason": string
}

If the comment is acceptable, return:

{
  "is_inappropriate": false,
  "reason": ""
}
`,
    },
    {
      role: "user",
      content: `
Comment: ${comment.content}
User: ${comment.author.username}

Reporter's reason:
${body.reason}
`,
    },
  ])

  const result = JSON.parse(output)

  if (result.is_inappropriate) {
    await Admin.flagComment(comment.id)
    await NotificationService.send(
      comment.authorId,
      "quacky",
      `Hello, ${comment.author.name}. \n\nYour [comment](${env.BETTER_AUTH_URL}/comment/${comment.id}) which you made on **${new Date().toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}** has been flagged for review due to a violation of our [Community Guidelines](https://quacky.space/terms).\n\nReason given: **${result.reason}**\n\nIf you believe this is a mistake, please contact an school administrator.`
    )
  }

  await addXP(session.user.username, xp.report)

  await Up.ingest({
    title: "Comment Report - " + comment.id,
    icon: "🚩",
    content: `A new report has been submitted for comment ${comment.id}. Reason: ${body.reason}`,
    fields: [
      {
        name: "Author Username",
        value: comment.author.username,
      },
      {
        name: "Author ID",
        value: comment.authorId,
      },
      {
        name: "Auto Flagged?",
        value: result.is_inappropriate ? "Yes" : "No",
      },
      {
        name: "AI Reason",
        value: result.reason,
      },
    ],
    data: {
      offender: comment,
      reportReason: body.reason,
      ai: {
        isInappropriate: result.is_inappropriate,
        reason: result.reason,
      },
    },
    actions: [
      {
        title: "View Comment",
        type: "default",
        url: `https://quacky.space/comment/${comment.id}`,
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
