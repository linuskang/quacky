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
import { auth } from "@/server/auth"
import { NextRequest, NextResponse } from "next/server"
import { NotificationService } from "@/server/helpers"
import { extractHashtags } from "@/lib/hashtags"
import { xp } from "@/lib/var"
import { addXP } from "@/server/users"

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: req.headers,
  })

  if (!session) {
    return NextResponse.json(
      {
        err: "Unauthorized",
      },
      {
        status: 401,
      }
    )
  }

  const body = (await req.json()) as {
    postId: string
    content: string
  }

  if (!body.postId || !body.content) {
    return NextResponse.json(
      {
        err: "Post ID and content are required",
      },
      {
        status: 400,
      }
    )
  }

  const content = body.content.trim()

  if (!body.postId || !content) {
    return NextResponse.json(
      {
        err: "Post ID and content are required",
      },
      {
        status: 400,
      }
    )
  }

  const res = await prisma.post.findFirst({
    where: {
      id: body.postId,
      flagged: false,
      author: {
        banned: false,
      },
    },
  })

  if (!res) {
    return NextResponse.json(
      {
        err: "Post not found",
      },
      {
        status: 404,
      }
    )
  }

  const post = await prisma.post.create({
    data: {
      authorId: session.user.id,
      repostOfId: body.postId,
      content: content,
      postViews: {
        create: {
          userId: session.user.id,
        },
      },
      hashtags: {
        create: extractHashtags(content).map((tag) => ({
          tag,
        })),
      },
    },
  })

  await NotificationService.sendEngagement(
    "quote",
    res.authorId,
    session.user.id,
    res.id
  )

  await addXP(session.user.username, xp.post)

  return NextResponse.json(
    {
      success: true,
      post,
    },
    {
      status: 201,
    }
  )
}
