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
import { env } from "@/env"
import OpenAI from "openai"
import { Resend } from "resend"

let ai: OpenAI | null = null

function getAI() {
    if (!ai) {
        ai = new OpenAI({
            apiKey: env.AI_KEY,
            baseURL: env.AI_URL,
        })
    }
    return ai
}

export const Email = new Resend(env.RESEND_API_KEY)

export async function chat(messages: OpenAI.Chat.ChatCompletionMessageParam[]) {
    const response = await getAI().chat.completions.create({
        model: env.AI_MODEL!,
        messages,
    })

    return response.choices[0].message.content ?? ""
}

// i like to modularise everthing in my codebase that i need to constantly repeat, so here is a simple harness for ai chatting.
export async function askAi(systemPrompt: string, userPrompt: string) {
    const res = await chat([
        {
            role: "system",
            content: systemPrompt,
        },
        {
            role: "user",
            content: userPrompt,
        }
    ])

    return res
}

type EngagementNotificationType = "like" | "repost" | "quote" | "comment"

const engagementCopy: Record<EngagementNotificationType, string> = {
    like: "liked your",
    repost: "reposted your",
    quote: "quoted your",
    comment: "commented on your",
}

function engagementContent(type: EngagementNotificationType, postId: string) {
    return `${engagementCopy[type]} [post](${env.BETTER_AUTH_URL}/post/${postId})`
}

function followContent() {
    return "started following you"
}

export class NotificationService {
    static async send(userId: string, actorId: string, content: string) {
        const res = await prisma.notification.create({
            data: {
                userId,
                actorId,
                content,
            },
        })
        return res
    }

    static async sendEngagement(
        type: EngagementNotificationType,
        userId: string,
        actorId: string,
        postId: string
    ) {
        if (userId === actorId) return null

        return NotificationService.send(
            userId,
            actorId,
            engagementContent(type, postId)
        )
    }

    static async removeEngagement(
        type: EngagementNotificationType,
        userId: string,
        actorId: string,
        postId: string
    ) {
        await prisma.notification.deleteMany({
            where: {
                userId,
                actorId,
                content: engagementContent(type, postId),
            },
        })
    }

    static async removeEngagementsForPost(postId: string) {
        await prisma.notification.deleteMany({
            where: {
                content: {
                    in: Object.keys(engagementCopy).map((type) =>
                        engagementContent(
                            type as EngagementNotificationType,
                            postId
                        )
                    ),
                },
            },
        })
    }

    static async sendFollow(userId: string, actorId: string) {
        if (userId === actorId) return null

        return NotificationService.send(userId, actorId, followContent())
    }

    static async removeFollow(userId: string, actorId: string) {
        await prisma.notification.deleteMany({
            where: {
                userId,
                actorId,
                content: followContent(),
            },
        })
    }
}
