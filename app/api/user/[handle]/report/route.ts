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

import { chat } from "@/server/helpers"
import { getSession } from "@/server/auth"
import { NextRequest, NextResponse } from "next/server"
import { getUser } from "@/server/users"
import { Admin } from "@/server/administration"
import { Up } from "@/server/upstream"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  const session = await getSession()
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const { handle } = await params
  const { reason } = await req.json()

  if (!reason) {
    return new Response("Reason is required", { status: 400 })
  }

  const user = await getUser(handle)

  if (!user) {
    return new Response("User not found", { status: 404 })
  }

  const output = await chat([
    {
      role: "system",
      content: `
You are a content moderation system for Quacky.

Determine whether a user's profile violates Quacky's rules.

A profile is inappropriate if it contains or promotes:
- hate speech
- threats or encouragement of violence
- harassment or targeted bullying
- explicit sexual content
- spam, scams, or impersonation
- encouragement of self-harm
- private personal information (doxxing)
- usernames or profile text designed primarily to abuse or evade moderation

The report reason is only additional context. Do NOT assume the report is truthful.
However, with your own judgement, if the user's details are inappropriate, return true even if the report reason is not entirely accurate.

Return ONLY valid JSON.

{
  "is_inappropriate": boolean,
  "reason": string
}

If the profile is acceptable, return:

{
  "is_inappropriate": false,
  "reason": ""
}
`,
    },
    {
      role: "user",
      content: `
Display name: ${user.name}
Username: ${user.username}
Bio: ${user.bio ?? ""}
Pronouns: ${user.pronoun ?? ""}
Location: ${user.location ?? ""}
Website: ${user.website ?? ""}

Reporter's reason:
${reason}
`,
    },
  ])

  const result = JSON.parse(output)

  if (result.is_inappropriate) {
    await Admin.banUser(user.id, result.reason)
  }

  await Up.ingest({
    title: "User Report - " + user.username,
    icon: "🚩",
    content: `A new report has been submitted for user ${user.username}. Reason: ${reason}`,
    fields: [
      {
        name: "User ID",
        value: user.id,
      },
      {
        name: "User Email",
        value: user.email,
      },
      {
        name: "Auto Banned?",
        value: result.is_inappropriate ? "Yes" : "No",
      },
      {
        name: "AI Reason",
        value: result.reason,
      },
    ],
    data: {
      offender: user,
      reportReason: reason,
      ai: {
        isInappropriate: result.is_inappropriate,
        reason: result.reason,
      },
    },
    actions: [
      {
        title: "View User",
        type: "default",
        url: `https://quacky.space/@${user.username}`,
      },
    ],
  })

  return NextResponse.json(
    { message: "Report submitted successfully" },
    { status: 201 }
  )
}
