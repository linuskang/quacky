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
import { NotificationService } from "@/server/helpers"

const MENTION_REGEX = /(^|[^\w])@([a-zA-Z0-9_]+)/g

export function extractMentionUsernames(content: string) {
    const usernames = new Set<string>()

    for (const match of content.matchAll(MENTION_REGEX)) {
        usernames.add(match[2].toLowerCase())
    }

    return [...usernames]
}

export async function sendMentionNotifications({
    content,
    actorId,
    actorUsername,
    message,
}: {
    content: string
    actorId: string
    actorUsername: string
    message: string
}) {
    const usernames = extractMentionUsernames(content).filter(
        (username) => username !== actorUsername.toLowerCase()
    )

    if (usernames.length === 0) return

    const users = await prisma.user.findMany({
        where: {
            username: {
                in: usernames,
                mode: "insensitive",
            },
            banned: false,
        },
        select: {
            id: true,
        },
    })

    await Promise.all(
        users.map((user) => NotificationService.send(user.id, actorId, message))
    )
}
