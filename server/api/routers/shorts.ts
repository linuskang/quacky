import { TRPCError } from "@trpc/server"
import { z } from "zod"

import { env } from "@/env"
import { protectedProcedure, router } from "@/server/api/trpc"
import { chat, NotificationService } from "@/server/helpers"
import { prisma } from "@/server/prisma"
import {
    getPublicObjectUrl,
    getStorageKey,
    uploadObject,
} from "@/server/storage"
import { Up } from "@/server/upstream"

export const shortsRouter = router({
    list: protectedProcedure
        .meta({ description: "List unflagged short videos." })
        .query(async () => {
            return prisma.short.findMany({
                where: { flagged: false },
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    description: true,
                    url: true,
                    user: {
                        select: {
                            id: true,
                            username: true,
                        },
                    },
                },
            })
        }),

    byId: protectedProcedure
        .meta({ description: "Get a single short video by ID." })
        .input(z.object({ id: z.string().min(1) }))
        .query(async ({ input }) => {
            const short = await prisma.short.findUnique({
                where: { id: input.id },
                select: {
                    id: true,
                    description: true,
                    url: true,
                    flagged: true,
                    createdAt: true,
                    user: {
                        select: {
                            id: true,
                            username: true,
                            name: true,
                            image: true,
                        },
                    },
                },
            })

            if (!short) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Short not found",
                })
            }

            return {
                id: short.id,
                description: short.description,
                url: getPublicObjectUrl(short.url),
                flagged: short.flagged,
                createdAt: short.createdAt.toISOString(),
                user: short.user,
            }
        }),

    create: protectedProcedure
        .meta({
            description: "Upload a short video via multipart FormData (`video` file and optional `description`).",
            contentType: "multipart/form-data",
        })
        .input(z.instanceof(FormData))
        .mutation(async ({ ctx, input }) => {
            const descriptionValue = input.get("description")
            const description =
                typeof descriptionValue === "string" ? descriptionValue : ""
            const video = input.get("video")

            if (!(video instanceof File) || video.size === 0) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Video is required",
                })
            }

            const key = getStorageKey(ctx.session.user.id, crypto.randomUUID())

            await uploadObject({
                key,
                body: Buffer.from(await video.arrayBuffer()),
                contentType: video.type,
            })

            const short = await prisma.short.create({
                data: {
                    userId: ctx.session.user.id,
                    description,
                    url: key,
                },
            })

            await Up.ingest({
                title: "New short posted by " + ctx.session.user.username,
                description,
                fields: [
                    { title: "Posted By", value: ctx.session.user.username },
                    { title: "Poster Email", value: ctx.session.user.email },
                ],
                icon: "‼️",
                actions: [
                    {
                        title: "View short",
                        variant: "primary",
                        url: `${env.BETTER_AUTH_URL}/shorts/${short.id}`,
                    },
                ],
            })

            return {
                success: true,
                shortId: short.id,
            }
        }),

    report: protectedProcedure
        .meta({ description: "Report a short video for moderation review." })
        .input(
            z.object({
                id: z.string().min(1),
                reason: z.string().trim().min(1, "Reason is required"),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const short = await prisma.short.findUnique({
                where: { id: input.id },
                select: {
                    id: true,
                    description: true,
                    url: true,
                    user: {
                        select: {
                            id: true,
                            username: true,
                        },
                    },
                },
            })

            if (!short) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Short not found",
                })
            }

            const out = await chat([
                {
                    role: "system",
                    content: `
You are a content moderation system for Quacky.

Determine whether a user video short violates Quacky's rules.

A video short is inappropriate if it contains or promotes:
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
Video short description: ${short.description}
Author: ${short.user.username}

Reporter's reason:
${input.reason}
`,
                },
            ])

            const res = JSON.parse(out) as {
                is_inappropriate: boolean
                reason?: string
            }

            if (res.is_inappropriate) {
                await prisma.short.update({
                    where: { id: input.id },
                    data: { flagged: true },
                })

                await NotificationService.send(
                    short.user.id,
                    "quacky",
                    `Hello, ${short.user.username}. \n\nYour [short](${env.BETTER_AUTH_URL}/short/${short.id}) which you made on **${new Date().toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}** has been taken down due to a violation of our [Community Guidelines](https://quacky.space/terms).\n\nReason given: **${res.reason}**\n\nIf you believe this is a mistake, please contact an school administrator.`
                )
            }

            await Up.ingest({
                title: "Short Report - " + short.id,
                icon: "🚩",
                description: `A new report has been submitted for short ${short.id}. Reason: ${input.reason}`,
                fields: [
                    { title: "Author Username", value: short.user.username },
                    { title: "Author ID", value: short.user.id },
                    {
                        title: "Auto Flagged?",
                        value: res.is_inappropriate.toString(),
                    },
                    { title: "AI Reason", value: res.reason ?? "" },
                ],
                data: {
                    short,
                    session: ctx.session,
                    res,
                },
                actions: [
                    {
                        title: "View short",
                        variant: "primary",
                        url: `${env.BETTER_AUTH_URL}/short/${short.id}`,
                    },
                    {
                        title: "View offender",
                        variant: "secondary",
                        url: `${env.BETTER_AUTH_URL}/@${short.user.username}`,
                    },
                ],
            })

            return { success: true }
        }),
})
