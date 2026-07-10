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

import { auth } from "@/server/auth"
import { NotificationService } from "@/server/helpers"
import { prisma } from "@/server/prisma"
import { NextRequest, NextResponse } from "next/server"
import { follow, unfollow } from "@/server/follow"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  const session = await auth.api.getSession({
    headers: req.headers,
  })

  if (!session) {
    return NextResponse.json({ err: "Unauthorized" }, { status: 401 })
  }

  const { handle } = await params
  const user = await prisma.user.findUnique({
    where: { username: handle },
    select: { id: true },
  })

  if (!user) {
    return NextResponse.json({ err: "User not found" }, { status: 404 })
  }

  if (user.id === session.user.id) {
    return NextResponse.json(
      { err: "You cannot follow yourself" },
      { status: 400 }
    )
  }

  await follow(session.user.id, user.id)

  return NextResponse.json(
    {
      success: true,
    },
    {
      status: 201,
    }
  )
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  const session = await auth.api.getSession({
    headers: req.headers,
  })

  if (!session) {
    return NextResponse.json({ err: "Unauthorized" }, { status: 401 })
  }

  const { handle } = await params
  const user = await prisma.user.findUnique({
    where: { username: handle },
    select: { id: true },
  })

  if (!user) {
    return NextResponse.json({ err: "User not found" }, { status: 404 })
  }

  await unfollow(session.user.id, user.id)

  return NextResponse.json(
    {
      success: true,
    },
    {
      status: 200,
    }
  )
}
