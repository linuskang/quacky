//   ______                                 __
//  /      \                               /  |
// /$$$$$$  | __    __   ______    _______ $$ |   __  __    __
// $$ |  $$ |/  |  /  | /      \  /       |$$ |  /  |/  |  /  |
// $$ |  $$ |$$ |  $$ | $$$$$$  |/$$$$$$$/ $$ |_/$$/ $$ |  $$ |
// $$ |_ $$ |$$ |  $$ | /    $$ |$$ |      $$   $$<  $$ |  $$ |
// $$ / \$$ |$$ \\__$$ |/$$$$$$$ |$$ \\_____ $$$$$$  \ $$ \\__$$ |
// $$ $$ $$< $$    $$/ $$    $$ |$$       |$$ | $$  |$$    $$ |
//  $$$$$$  | $$$$$$/   $$$$$$$/  $$$$$$$/ $$/   $$/  $$$$$$$ |
//      $$$/                                         /  \__$$ |
//                                                   $$    $$/
//                                                    $$$$$$/
//
// Linus Kang, 2026
// Work is licensed under the CC BY-NC 4.0 license.

import { NextRequest } from "next/server"
import { getSession } from "@/server/auth"
import { Admin } from "@/server/administration"
import { Response } from "@/lib/responses"
import { Up } from "@/server/upstream"
import { z } from "zod"

const broadcastSchema = z.object({
    userId: z.string().trim().min(1).default("quacky"),
    content: z
        .string()
        .trim()
        .min(1, "Notification content cannot be empty"),
})

export async function POST(req: NextRequest) {
    const session = await getSession()

    if (!session) return Response.Unauthorized()
    if (session.user.role !== "admin") return Response.Forbidden()

    const body = await req.json().catch(() => null)
    const parsed = broadcastSchema.safeParse(body)

    if (!parsed.success) {
        return Response.BadRequest(
            parsed.error.issues[0]?.message ?? "Invalid notification data"
        )
    }

    const { userId, content } = parsed.data

    try {
        const result = await Admin.broadcastNotification({
            userId,
            content,
        })

        try {
            await Up.ingest({
                title: "Broadcast notification sent",
                description: `${session.user.name} sent a notification to ${result.count} accounts as user ID ${userId}.`,
                icon: "📢",
                category: "admin.notification.broadcast",
                fields: [
                    {
                        title: "Admin",
                        value: `${session.user.name} (@${session.user.username})`,
                    },
                    {
                        title: "User ID",
                        value: userId,
                    },
                    {
                        title: "Recipients",
                        value: `${result.count} accounts`,
                    },
                    {
                        title: "Message",
                        value: content,
                    },
                ],
                data: {
                    adminId: session.user.id,
                    userId,
                    recipientCount: result.count,
                    content,
                },
            })
        } catch (upstreamErr) {
            console.error("Failed to log broadcast to Upstream:", upstreamErr)
        }

        return Response.Success({
            count: result.count,
            message: `Notification successfully sent to ${result.count} accounts.`,
        })
    } catch (err: unknown) {
        const message =
            err instanceof Error ? err.message : "Failed to broadcast notification"
        return Response.BadRequest(message)
    }
}
