import { TRPCError } from "@trpc/server"
import { z } from "zod"

import { adminProcedure, protectedProcedure, router } from "@/server/api/trpc"
import { NotificationService } from "@/server/helpers"
import { prisma } from "@/server/prisma"
import { Up } from "@/server/upstream"

export const shopRouter = router({
    list: protectedProcedure
        .meta({
            description:
                "List available shop items along with the signed-in user's point balance.",
        })
        .query(async ({ ctx }) => {
            const [items, user] = await Promise.all([
                prisma.shopItem.findMany({
                    where: { available: true },
                }),
                prisma.user.findUnique({
                    where: { id: ctx.session.user.id },
                    select: { points: true },
                }),
            ])

            return {
                items,
                points: user?.points ?? 0,
            }
        }),

    byId: protectedProcedure
        .meta({ description: "Get details of a single shop item by ID." })
        .input(z.object({ id: z.string().min(1) }))
        .query(async ({ input }) => {
            const item = await prisma.shopItem.findUnique({
                where: { id: input.id },
            })

            if (!item) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Item not found",
                })
            }

            return item
        }),

    purchase: protectedProcedure
        .meta({ description: "Purchase a shop item using points." })
        .input(
            z.object({
                id: z.string().min(1),
                quantity: z.number().int().min(1),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const item = await prisma.shopItem.findUnique({
                where: { id: input.id },
            })

            if (!item) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Item not found",
                })
            }

            if (item.stock <= 0 || item.stock < input.quantity) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Item is out of stock",
                })
            }

            const total = item.price * input.quantity

            const purchase = await prisma.shopPurchase.create({
                data: {
                    userId: ctx.session.user.id,
                    itemId: item.id,
                    quantity: input.quantity,
                },
            })

            await prisma.user.update({
                where: { id: ctx.session.user.id },
                data: { points: { decrement: total } },
            })

            await prisma.shopItem.update({
                where: { id: item.id },
                data: { stock: { decrement: input.quantity } },
            })

            await NotificationService.send(
                ctx.session.user.id,
                "quacky",
                `Hey!\n\nThanks for purchasing ${item.name} in the shop (${input.quantity}x ${item.name} for $${total})!\n\nYour order is now in the queue for review. This may take some time, so sit tight.\n\nYou will be notified here once your order status is updated.\n\n*This is an automated message from Quacky, please do not reply to this message.*`
            )

            await Up.ingest({
                title: "Shop Purchase",
                icon: "👜",
                description: `${ctx.session.user.name} purchased ${input.quantity}x ${item.name}`,
                fields: [
                    { title: "User", value: ctx.session.user.email },
                    { title: "Item", value: item.name },
                    { title: "Quantity", value: input.quantity.toString() },
                    { title: "Item ID", value: item.id },
                ],
                data: {
                    purchase,
                    item,
                    session: ctx.session,
                },
            })

            return purchase
        }),

    myOrders: protectedProcedure
        .meta({ description: "List the signed-in user's shop purchases with pagination." })
        .input(
            z
                .object({
                    page: z.number().int().min(1).default(1),
                    pageSize: z.number().int().min(1).max(50).default(10),
                })
                .optional()
        )
        .query(async ({ ctx, input }) => {
            const pageSize = input?.pageSize ?? 10
            const requestedPage = input?.page ?? 1

            const total = await prisma.shopPurchase.count({
                where: { userId: ctx.session.user.id },
            })
            const totalPages = Math.max(1, Math.ceil(total / pageSize))
            const page = Math.min(totalPages, Math.max(1, requestedPage))

            const orders = await prisma.shopPurchase.findMany({
                where: { userId: ctx.session.user.id },
                include: { item: true },
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * pageSize,
                take: pageSize,
            })

            return {
                orders,
                page,
                pageSize,
                total,
                totalPages,
            }
        }),

    wishlistList: protectedProcedure
        .meta({ description: "Get the signed-in user's shop wishlist and points balance." })
        .query(async ({ ctx }) => {
            const [items, user] = await Promise.all([
                prisma.shopWishlist.findMany({
                    where: { userId: ctx.session.user.id },
                    include: { item: true },
                }),
                prisma.user.findUnique({
                    where: { id: ctx.session.user.id },
                    select: { points: true },
                }),
            ])

            return {
                items,
                points: user?.points ?? 0,
            }
        }),

    wishlistAdd: protectedProcedure
        .meta({ description: "Add an item to the signed-in user's wishlist." })
        .input(z.object({ itemId: z.string().min(1) }))
        .mutation(async ({ ctx, input }) => {
            const existing = await prisma.shopWishlist.findUnique({
                where: {
                    userId_itemId: {
                        userId: ctx.session.user.id,
                        itemId: input.itemId,
                    },
                },
                include: { item: true },
            })

            if (existing) {
                return existing
            }

            return prisma.shopWishlist.create({
                data: {
                    userId: ctx.session.user.id,
                    itemId: input.itemId,
                },
                include: { item: true },
            })
        }),

    wishlistRemove: protectedProcedure
        .meta({ description: "Remove an item from the signed-in user's wishlist." })
        .input(z.object({ itemId: z.string().min(1) }))
        .mutation(async ({ ctx, input }) => {
            await prisma.shopWishlist.deleteMany({
                where: {
                    userId: ctx.session.user.id,
                    itemId: input.itemId,
                },
            })

            return { deleted: true }
        }),

    suggestionsList: protectedProcedure
        .meta({ description: "List pending shop item suggestions." })
        .query(async () => {
            return prisma.shopSuggestion.findMany({
                where: { pending: true },
                select: {
                    id: true,
                    name: true,
                    image: true,
                    description: true,
                    createdByUserId: true,
                    createdAt: true,
                    createdBy: {
                        select: {
                            id: true,
                            verified: true,
                            role: true,
                            name: true,
                            image: true,
                        },
                    },
                    pending: true,
                    shopSuggestionVotes: true,
                },
            })
        }),

    suggestionsCreate: protectedProcedure
        .meta({ description: "Submit a new shop item suggestion." })
        .input(
            z.object({
                name: z.string().trim().min(1),
                image: z.string().trim().min(1),
                description: z.string().trim().min(1),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const suggestion = await prisma.shopSuggestion.create({
                data: {
                    name: input.name,
                    image: input.image,
                    description: input.description,
                    createdByUserId: ctx.session.user.id,
                },
            })

            await Up.ingest({
                title: "New Shop Suggestion",
                icon: "🛍️",
                description: `A new shop suggestion has been submitted by ${ctx.session.user.name}.`,
                category: "shop-suggestion",
                fields: [
                    { title: "Name", value: input.name },
                    { title: "Image", value: input.image },
                    { title: "Description", value: input.description },
                    { title: "Submitted By", value: ctx.session.user.email },
                ],
            })

            return suggestion
        }),

    suggestionsUpdateStatus: adminProcedure
        .meta({ description: "Update a shop suggestion's pending state (admin only)." })
        .input(
            z.object({
                id: z.string().min(1),
                pending: z.boolean(),
            })
        )
        .mutation(async ({ input }) => {
            return prisma.shopSuggestion.update({
                where: { id: input.id },
                data: { pending: input.pending },
            })
        }),

    suggestionVotes: protectedProcedure
        .meta({ description: "List votes for a given shop suggestion." })
        .input(z.object({ id: z.string().min(1) }))
        .query(async ({ input }) => {
            return prisma.shopSuggestionVote.findMany({
                where: { suggestionId: input.id },
                select: {
                    id: true,
                    userId: true,
                    createdAt: true,
                    updatedAt: true,
                },
            })
        }),
})
