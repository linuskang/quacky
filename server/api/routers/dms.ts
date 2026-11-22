import { TRPCError } from "@trpc/server"
import { z } from "zod"

import { dmsProcedure, protectedProcedure, router } from "@/server/api/trpc"
import { fetchConversations, fetchMessages } from "@/server/dms"
import { prisma } from "@/server/prisma"

export const dmsRouter = router({
    conversations: protectedProcedure
        .meta({ description: "List direct message conversations for the signed-in user." })
        .query(async ({ ctx }) => {
            return fetchConversations({ userId: ctx.session.user.id })
        }),

    messages: dmsProcedure
        .meta({ description: "Fetch direct messages between the signed-in user and another handle." })
        .input(z.object({ handle: z.string().trim().min(1) }))
        .query(async ({ ctx, input }) => {
            const other = await prisma.user.findUnique({
                where: { username: input.handle },
                select: { id: true },
            })

            if (!other) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "User not found",
                })
            }

            if (other.id === ctx.session.user.id) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "You can't message yourself",
                })
            }

            return fetchMessages({
                userId: ctx.session.user.id,
                otherUserId: other.id,
            })
        }),

    send: dmsProcedure
        .meta({ description: "Send a direct message to another user by handle." })
        .input(
            z.object({
                handle: z.string().trim().min(1),
                message: z
                    .string()
                    .trim()
                    .min(1, "message must be between 1 and 1000 characters.")
                    .max(1000, "message must be between 1 and 1000 characters."),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const other = await prisma.user.findUnique({
                where: { username: input.handle },
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
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "User not found",
                })
            }

            if (other.id === ctx.session.user.id) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "You can't message yourself",
                })
            }

            const dm = await prisma.dm.create({
                data: {
                    senderId: ctx.session.user.id,
                    receiverId: other.id,
                    message: input.message,
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

            return {
                id: dm.id,
                sender: dm.sender,
                receiver: dm.receiver,
                message: dm.message,
                read: dm.read,
                createdAt: dm.createdAt.toISOString(),
            }
        }),
})
