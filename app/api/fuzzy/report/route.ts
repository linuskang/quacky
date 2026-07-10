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

import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/server/auth"
import { prisma } from "@/server/prisma"
import { chat } from "@/server/helpers"
import { Up } from "@/server/upstream"

type Fuzzy = {
  id: string
  reason: string
}

export async function POST(req: NextRequest) {
  const session = await getSession()

  if (!session) {
    return new NextResponse("Unauthorised", {
      status: 401,
    })
  }

  const body = (await req.json()) as Fuzzy

  if (!body.id || !body.reason) {
    return new NextResponse("Missing required fields", {
      status: 400,
    })
  }

  const fuzzy = await prisma.fuzzy.findUnique({
    where: {
      id: body.id,
    },
    include: {
      author: true,
    },
  })

  if (!fuzzy) {
    return new NextResponse("Fuzzy not found", {
      status: 404,
    })
  }

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

The report reason is only additional context. Do NOT assume the report is truthful.
However, with your own judgement, if the user's post is inappropriate, return true even if the report reason is not entirely accurate.

Please remember that you are being called beacuse a user has reported this warm fuzzy. You should take into their account as well, however, do not rely on their stance on the situation if you are confident it is not inapropriate.

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
The following content was reported by the user: "${fuzzy.message}".

The user reported the content for the following reason: "${body.reason}".
            `,
    },
  ])

  const result = JSON.parse(output)

  let aiFlagged = false

  if (result.is_inappropriate) {
    aiFlagged = true
    await prisma.fuzzy.update({
      where: {
        id: fuzzy.id,
      },
      data: {
        flagged: true,
      },
    })
  }

  await Up.ingest({
    title: `Warm fuzzy reported by ${session.user.email}`,
    icon: "🚨",
    content: `${session.user.name} (${session.user.id}) reported a warm fuzzy sent by ${fuzzy.author.username} (${fuzzy.author.id}).`,
    fields: [
      {
        name: "User Reason",
        value: body.reason,
      },
      {
        name: "AI Flagged",
        value: aiFlagged.toString(),
      },
      {
        name: "AI Reason",
        value: result.reason,
      },
      {
        name: "Warm Fuzzy Content",
        value: fuzzy.message,
      },
    ],
    actions: [
      {
        title: "View Warm Fuzzy",
        type: "default",
        url: `${process.env.BETTER_AUTH_URL}/fuzzy/${fuzzy.id}`,
      },
      {
        title: "View Reported Sender",
        type: "secondary",
        url: `${process.env.BETTER_AUTH_URL}/@${fuzzy.author.username}`,
      },
    ],
  })

  return NextResponse.json(
    {
      success: true,
    },
    { status: 200 }
  )
}
