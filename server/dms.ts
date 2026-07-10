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

import "server-only"

import { prisma } from "@/server/prisma"
import type { Conversation, Dm } from "@/types"

const userSelect = {
  id: true,
  name: true,
  username: true,
  image: true,
  verified: true,
  role: true,
} as const

// A conversation is derived from the Dm table — there's no separate
// Conversation model. Two users have a conversation if any Dm exists
// between them (in either direction).
export async function fetchConversations({
  userId,
}: {
  userId: string
}): Promise<Conversation[]> {
  const dms = await prisma.dm.findMany({
    where: {
      OR: [{ senderId: userId }, { receiverId: userId }],
    },
    include: {
      sender: { select: userSelect },
      receiver: { select: userSelect },
    },
    orderBy: { createdAt: "desc" },
  })

  const byUser = new Map<string, Conversation>()

  for (const dm of dms) {
    const otherId = dm.senderId === userId ? dm.receiverId : dm.senderId
    const other = dm.senderId === userId ? dm.receiver : dm.sender

    const existing = byUser.get(otherId)

    if (!existing) {
      byUser.set(otherId, {
        user: other,
        lastMessage: dm.message,
        lastMessageAt: dm.createdAt.toISOString(),
        unread: dm.receiverId === userId && !dm.read ? 1 : 0,
      })
      continue
    }

    // dms are ordered desc by createdAt, so the first one we see for
    // a pair is the newest — don't overwrite it. Just bump unread.
    if (dm.receiverId === userId && !dm.read) {
      existing.unread += 1
    }
  }

  return Array.from(byUser.values()).sort((a, b) =>
    b.lastMessageAt.localeCompare(a.lastMessageAt)
  )
}

export async function fetchMessages({
  userId,
  otherUserId,
}: {
  userId: string
  otherUserId: string
}): Promise<Dm[]> {
  const dms = await prisma.dm.findMany({
    where: {
      OR: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ],
    },
    include: {
      sender: { select: userSelect },
      receiver: { select: userSelect },
    },
    orderBy: { createdAt: "asc" },
  })

  return dms.map((dm) => ({
    id: dm.id,
    sender: dm.sender,
    receiver: dm.receiver,
    message: dm.message,
    read: dm.read,
    createdAt: dm.createdAt.toISOString(),
  }))
}

export async function markConversationRead({
  userId,
  otherUserId,
}: {
  userId: string
  otherUserId: string
}) {
  await prisma.dm.updateMany({
    where: {
      senderId: otherUserId,
      receiverId: userId,
      read: false,
    },
    data: { read: true },
  })
}
