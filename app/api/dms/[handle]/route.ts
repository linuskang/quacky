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
import { fetchMessages } from "@/server/dms"
import { NextRequest, NextResponse } from "next/server"

// GET messages between the current user and the user identified by `handle`.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  const session = await getSession()

  if (!session) {
    return NextResponse.json({ err: "Unauthorized" }, { status: 401 })
  }

  const { handle } = await params

  const other = await prisma.user.findUnique({
    where: { username: handle },
    select: { id: true },
  })

  if (!other) {
    return NextResponse.json({ err: "User not found" }, { status: 404 })
  }

  if (other.id === session.user.id) {
    return NextResponse.json(
      { err: "You can't message yourself" },
      { status: 400 }
    )
  }

  const messages = await fetchMessages({
    userId: session.user.id,
    otherUserId: other.id,
  })

  return NextResponse.json(messages)
}

export interface DmBody {
  message: string
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  const session = await getSession()

  if (!session) {
    return NextResponse.json({ err: "Unauthorized" }, { status: 401 })
  }

  const { handle } = await params

  const other = await prisma.user.findUnique({
    where: { username: handle },
    select: {
      id: true,
      name: true,
      username: true,
      image: true,
      verified: true,
      role: true,
    },
  })

  if (!other) {
    return NextResponse.json({ err: "User not found" }, { status: 404 })
  }

  if (other.id === session.user.id) {
    return NextResponse.json(
      { err: "You can't message yourself" },
      { status: 400 }
    )
  }

  const body = (await req.json()) as DmBody

  if (!body.message) {
    return NextResponse.json({ err: "Message is required" }, { status: 400 })
  }

  const message = body.message.trim()

  if (message.length === 0 || message.length > 1000) {
    return NextResponse.json({ err: "Invalid message length" }, { status: 400 })
  }

  const dm = await prisma.dm.create({
    data: {
      senderId: session.user.id,
      receiverId: other.id,
      message,
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
          verified: true,
          role: true,
        },
      },
      receiver: {
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
          verified: true,
          role: true,
        },
      },
    },
  })

  return NextResponse.json(
    {
      id: dm.id,
      sender: dm.sender,
      receiver: dm.receiver,
      message: dm.message,
      read: dm.read,
      createdAt: dm.createdAt.toISOString(),
    },
    { status: 201 }
  )
}
