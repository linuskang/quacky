import { TRPCError } from "@trpc/server"
import { z } from "zod"

import { env } from "@/env"
import {
    fuzziesProcedure,
    protectedProcedure,
    router,
} from "@/server/api/trpc"
import { Fuzzy as FuzzyServer } from "@/server/fuzzy"
import { chat } from "@/server/helpers"
import { prisma } from "@/server/prisma"
import { Up } from "@/server/upstream"
import { getUserById } from "@/server/users"

export const fuzziesRouter = router({
    list: protectedProcedure
        .meta({
            description:
                "Fetch warm fuzzies received by the signed-in user and mark them as read.",
        })
        .query(async ({ ctx }) => {
            const fuzzies = await prisma.fuzzy.findMany({
                where: { receiverId: ctx.session.user.id },
                orderBy: { createdAt: "desc" },
            })

            await FuzzyServer.markAllAsRead(ctx.session.user.id)

            return fuzzies
        }),

    send: fuzziesProcedure
        .meta({ description: "Send an anonymous warm fuzzy to another user." })
        .input(
            z.object({
                receiverId: z.string().min(1),
                message: z.string().trim().min(1),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const receiver = await getUserById(input.receiverId)

            if (!receiver) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Recipient not found",
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
- any other content that is deemed inappropriate to all ages.

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
The following was said in the user's warm fuzzy: "${input.message}".
            `,
                },
            ])

            const result = JSON.parse(output) as {
                is_inappropriate: boolean
                reason: string
            }
            let flagged = false

            if (result.is_inappropriate) {
                flagged = true
                await Up.ingest({
                    title: "AI Flagged an inappropriate warm fuzzy",
                    icon: "🚨",
                    description: `${ctx.session.user.name} (${ctx.session.user.id}) sent a warm fuzzy that was flagged by the AI as inappropriate. It has been hidden from the recipient.`,
                    fields: [
                        { title: "Reason", value: result.reason },
                        { title: "Warm Fuzzy Content", value: input.message },
                        { title: "Offender", value: ctx.session.user.id },
                        {
                            title: "Original recipient",
                            value: input.receiverId,
                        },
                    ],
                    actions: [
                        {
                            title: "View Reported Sender",
                            variant: "primary",
                            url: `${env.BETTER_AUTH_URL}/@${ctx.session.user.username}`,
                        },
                    ],
                })
            }

            await prisma.fuzzy.create({
                data: {
                    message: input.message,
                    authorId: ctx.session.user.id,
                    flagged,
                    receiverId: receiver.id,
                },
            })

            return { success: true }
        }),

    report: protectedProcedure
        .meta({ description: "Report an inappropriate warm fuzzy." })
        .input(
            z.object({
                id: z.string().min(1),
                reason: z.string().trim().min(1, "Reason is required"),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const fuzzy = await prisma.fuzzy.findUnique({
                where: { id: input.id },
                include: { author: true },
            })

            if (!fuzzy) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Sorry, but we couldnt find that warm fuzzy.",
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

The user reported the content for the following reason: "${input.reason}".
            `,
                },
            ])

            const result = JSON.parse(output) as {
                is_inappropriate: boolean
                reason: string
            }

            let aiFlagged = false

            if (result.is_inappropriate) {
                aiFlagged = true
                await prisma.fuzzy.update({
                    where: { id: fuzzy.id },
                    data: { flagged: true },
                })
            }

            await Up.ingest({
                title: `Warm fuzzy reported by ${ctx.session.user.email}`,
                icon: "🚨",
                description: `${ctx.session.user.name} (${ctx.session.user.id}) reported a warm fuzzy sent by ${fuzzy.author.username} (${fuzzy.author.id}).`,
                fields: [
                    { title: "User Reason", value: input.reason },
                    { title: "AI Flagged", value: aiFlagged.toString() },
                    { title: "AI Reason", value: result.reason },
                    { title: "Warm Fuzzy Content", value: fuzzy.message },
                ],
                actions: [
                    {
                        title: "View Warm Fuzzy",
                        variant: "primary",
                        url: `${env.BETTER_AUTH_URL}/fuzzy/${fuzzy.id}`,
                    },
                    {
                        title: "View Reported Sender",
                        variant: "secondary",
                        url: `${env.BETTER_AUTH_URL}/@${fuzzy.author.username}`,
                    },
                ],
            })

            return { message: "Reported, thanks!" }
        }),
})
