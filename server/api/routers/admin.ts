import { TRPCError } from "@trpc/server"
import { v4 as uuidv4 } from "uuid"
import { z } from "zod"

import { env } from "@/env"
import { Admin } from "@/server/administration"
import { adminProcedure, router } from "@/server/api/trpc"
import { auth } from "@/server/auth"
import { Email, NotificationService } from "@/server/helpers"
import { prisma } from "@/server/prisma"
import { Up } from "@/server/upstream"
import { getUser, getUsers } from "@/server/users"

const metrics = ["wellbeing", "happiness", "stress", "sleep", "energy"] as const
type Metric = (typeof metrics)[number]

function round(value: number) {
    return Math.round(value * 100) / 100
}

const nullableText = z.preprocess(
    (value) => (value === "" ? null : value),
    z.string().trim().nullable()
)

const nullableDate = z.preprocess(
    (value) => (value === "" ? null : value),
    z.coerce.date().nullable()
)

const userUpdateFieldsSchema = z.object({
    name: z.string().trim().min(1),
    username: z.string().trim().min(1),
    email: z.email(),
    emailVerified: z.boolean(),
    image: z.string().trim().min(1),
    verified: z.boolean(),
    statsForNerds: z.boolean(),
    private: z.boolean(),
    streamerMode: z.boolean(),
    hideTips: z.boolean(),
    bio: nullableText,
    bannerImage: nullableText,
    pronoun: nullableText,
    location: nullableText,
    website: nullableText,
    role: nullableText,
    banned: z.boolean().nullable(),
    banReason: nullableText,
    banExpires: nullableDate,
    parentEmail: nullableText,
    unlockedPosting: z.boolean(),
    unlockedCommenting: z.boolean(),
    unlockedDms: z.boolean(),
    unlockedFuzzies: z.boolean(),
    unlockedProfiles: z.boolean(),
    xp: z.number().int().min(0),
    points: z.number().int().min(0),
    pushNotificationsEnabled: z.boolean(),
})

type UserUpdateFields = z.infer<typeof userUpdateFieldsSchema>

function auditValue(value: unknown) {
    if (value instanceof Date) return value.toISOString()
    return value ?? null
}

const shopItemSchema = z.object({
    name: z.string().trim().min(1),
    description: z.string().trim().min(1),
    price: z.number().int().min(0),
    stock: z.number().int().min(0),
    category: z.string().trim().min(1),
    imageUrl: z.string().trim().min(1),
    available: z.boolean(),
    featured: z.boolean(),
})

export const adminRouter = router({
    stats: adminProcedure
        .meta({ description: "Get aggregate wellbeing check-in statistics (admin only)." })
        .query(async () => {
            const checkIns = await prisma.checkIn.findMany({
                select: {
                    userId: true,
                    date: true,
                    wellbeing: true,
                    happiness: true,
                    stress: true,
                    sleep: true,
                    energy: true,
                    assistance: true,
                },
                orderBy: { date: "asc" },
            })

            const totals = Object.fromEntries(
                metrics.map((metric) => [metric, 0])
            ) as Record<Metric, number>
            const distributions = Object.fromEntries(
                metrics.map((metric) => [
                    metric,
                    Array.from({ length: 5 }, (_, index) => ({
                        score: index + 1,
                        count: 0,
                    })),
                ])
            ) as Record<Metric, { score: number; count: number }[]>
            const daily = new Map<
                string,
                Record<Metric, number> & { checkIns: number }
            >()

            let assistanceRequests = 0

            for (const checkIn of checkIns) {
                const date = checkIn.date.toISOString().slice(0, 10)
                const day = daily.get(date) ?? {
                    checkIns: 0,
                    wellbeing: 0,
                    happiness: 0,
                    stress: 0,
                    sleep: 0,
                    energy: 0,
                }

                day.checkIns++
                assistanceRequests += Number(checkIn.assistance)

                for (const metric of metrics) {
                    const score = checkIn[metric]
                    totals[metric] += score
                    day[metric] += score

                    if (score >= 1 && score <= 5) {
                        distributions[metric][score - 1].count++
                    }
                }

                daily.set(date, day)
            }

            const totalCheckIns = checkIns.length
            const averages = Object.fromEntries(
                metrics.map((metric) => [
                    metric,
                    totalCheckIns ? round(totals[metric] / totalCheckIns) : 0,
                ])
            ) as Record<Metric, number>

            const dailyAverages = Array.from(daily, ([date, values]) => ({
                date,
                checkIns: values.checkIns,
                wellbeing: round(values.wellbeing / values.checkIns),
                happiness: round(values.happiness / values.checkIns),
                stress: round(values.stress / values.checkIns),
                sleep: round(values.sleep / values.checkIns),
                energy: round(values.energy / values.checkIns),
            }))

            return {
                summary: {
                    totalCheckIns,
                    participatingStudents: new Set(
                        checkIns.map((checkIn) => checkIn.userId)
                    ).size,
                    assistanceRequests,
                    assistanceRate: totalCheckIns
                        ? round((assistanceRequests / totalCheckIns) * 100)
                        : 0,
                    averages,
                },
                daily: dailyAverages,
                distributions,
            }
        }),

    invite: adminProcedure
        .meta({ description: "Invite and create a new user with a temporary password (admin only)." })
        .input(
            z.object({
                email: z.email(),
                role: z.enum(["admin", "user"]),
                displayName: z.string().trim().min(1),
                username: z.string().trim().min(1),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const newPassword = uuidv4()

            const res = await auth.api.createUser({
                body: {
                    email: input.email,
                    role: input.role,
                    name: input.displayName,
                    password: newPassword,
                    data: {
                        username: input.username,
                        emailVerified: true,
                    },
                },
            })

            const { error } = await Email.emails.send({
                from: env.EMAIL_FROM,
                to: input.email,
                subject: "You've been invited to join Quacky!",
                html: `
                    <p>Hello ${input.displayName},</p>
                    <p>You have been invited to join Quacky by your organisation (${env.ORG_NAME}).</p>
                    <div style="border: 1px solid #d1d5db; border-radius: 4px; padding: 10px 12px;">
                        <p style="margin: 0 0 8px;"><strong>Email:</strong> ${input.email}</p>
                        <p style="margin: 0;"><strong>Password:</strong> ${newPassword}</p>
                    </div>
                    <p>Click the link below to get started:</p>
                    <a href="${env.BETTER_AUTH_URL}/auth/login">Join Quacky</a>
                `,
            })

            if (error) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: error.message,
                })
            }

            await Up.ingest({
                title: `${input.email} has been invited to join Quacky`,
                icon: "🆕",
                description: `An invitation has been sent to ${input.email} with the role of ${input.role}.`,
                fields: [
                    { title: "Email", value: input.email },
                    { title: "Role", value: input.role },
                    { title: "Display Name", value: input.displayName },
                    { title: "Username", value: input.username },
                    { title: "Invited by", value: ctx.session.user.email },
                ],
                actions: [
                    {
                        variant: "primary",
                        title: "View User",
                        url: `${env.BETTER_AUTH_URL}/@${input.username}`,
                    },
                ],
                data: { res, session: ctx.session },
            })

            return {
                message: "User invited",
                tempPassword: newPassword,
            }
        }),

    lock: adminProcedure
        .meta({ description: "Update global site feature lock state (admin only)." })
        .input(z.object({ locked: z.boolean() }))
        .mutation(async ({ ctx, input }) => {
            await Up.ingest({
                title: "Site features restrictions updated",
                icon: input.locked ? "🔒" : "🔓",
                fields: [
                    { title: "Locked", value: input.locked ? "Yes" : "No" },
                    { title: "Updated by", value: ctx.session.user.email },
                ],
                data: { sess: ctx.session },
            })

            return { locked: input.locked }
        }),

    broadcastNotification: adminProcedure
        .meta({ description: "Broadcast a notification to all accounts (admin only)." })
        .input(
            z.object({
                userId: z.string().trim().min(1).default("quacky"),
                content: z
                    .string()
                    .trim()
                    .min(1, "Notification content cannot be empty"),
            })
        )
        .mutation(async ({ ctx, input }) => {
            try {
                const result = await Admin.broadcastNotification({
                    userId: input.userId,
                    content: input.content,
                })

                try {
                    await Up.ingest({
                        title: "Broadcast notification sent",
                        description: `${ctx.session.user.name} sent a notification to ${result.count} accounts as user ID ${input.userId}.`,
                        icon: "📢",
                        category: "admin.notification.broadcast",
                        fields: [
                            {
                                title: "Admin",
                                value: `${ctx.session.user.name} (@${ctx.session.user.username})`,
                            },
                            { title: "User ID", value: input.userId },
                            {
                                title: "Recipients",
                                value: `${result.count} accounts`,
                            },
                            { title: "Message", value: input.content },
                        ],
                        data: {
                            adminId: ctx.session.user.id,
                            userId: input.userId,
                            recipientCount: result.count,
                            content: input.content,
                        },
                    })
                } catch (upstreamErr) {
                    console.error(
                        "Failed to log broadcast to Upstream:",
                        upstreamErr
                    )
                }

                return {
                    count: result.count,
                    message: `Notification successfully sent to ${result.count} accounts.`,
                }
            } catch (err: unknown) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message:
                        err instanceof Error
                            ? err.message
                            : "Failed to broadcast notification",
                })
            }
        }),

    usersList: adminProcedure
        .meta({ description: "List all user accounts (admin only)." })
        .query(async () => {
            const users = await getUsers()
            return users.map((u) => ({
                id: u.id,
                name: u.name,
                image: u.image,
                email: u.email,
                username: u.username,
                role: u.role,
                verified: u.verified,
                createdAt: u.createdAt.toISOString(),
                updatedAt: u.updatedAt.toISOString(),
                banned: u.banned,
            }))
        }),

    userByHandle: adminProcedure
        .meta({ description: "Get a full user record by handle (admin only)." })
        .input(z.object({ handle: z.string().trim().min(1) }))
        .query(async ({ input }) => {
            const user = await getUser(input.handle)
            if (!user) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "User not found",
                })
            }
            return user
        }),

    userUpdate: adminProcedure
        .meta({ description: "Update a user's fields and audit changes (admin only)." })
        .input(
            userUpdateFieldsSchema.extend({
                handle: z.string().trim().min(1),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { handle, ...data } = input

            const existing = await prisma.user.findUnique({
                where: { username: handle },
            })
            if (!existing) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "User not found",
                })
            }

            const changes = Object.fromEntries(
                Object.keys(data)
                    .filter((key) => {
                        const field = key as keyof UserUpdateFields
                        return (
                            auditValue(existing[field]) !==
                            auditValue(data[field])
                        )
                    })
                    .map((key) => {
                        const field = key as keyof UserUpdateFields
                        return [
                            key,
                            {
                                old: auditValue(existing[field]),
                                new: auditValue(data[field]),
                            },
                        ]
                    })
            )

            if (Object.keys(changes).length === 0) {
                return existing
            }

            const user = await prisma.user.update({
                where: { id: existing.id },
                data,
            })

            await Up.ingest({
                title: "Admin updated user",
                description: `${ctx.session.user.name} updated ${user.username}.`,
                icon: "🛠️",
                category: "admin.user.updated",
                fields: [
                    { title: "User", value: `${user.name} (@${user.username})` },
                    {
                        title: "Changed fields",
                        value: Object.keys(changes).join(", "),
                    },
                    { title: "Admin", value: ctx.session.user.email },
                ],
                data: {
                    adminId: ctx.session.user.id,
                    targetUserId: user.id,
                    targetUsername: user.username,
                    changes,
                },
            })

            return user
        }),

    ordersList: adminProcedure
        .meta({ description: "List pending shop orders (admin only)." })
        .query(async () => {
            return prisma.shopPurchase.findMany({
                where: { status: "PENDING" },
                include: { item: true, user: true },
            })
        }),

    ordersUpdateStatus: adminProcedure
        .meta({
            description:
                "Fulfill or reject a pending shop order (refunding points and restoring stock on rejection; admin only).",
        })
        .input(
            z.object({
                orderId: z.string().min(1),
                actionOrderStatus: z.enum(["FULFILLED", "REJECTED"]),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const order = await prisma.shopPurchase.findUnique({
                where: { id: input.orderId },
                include: { item: true },
            })

            if (!order) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Order not found",
                })
            }

            const updatedOrderStatus = await prisma.shopPurchase.update({
                where: { id: input.orderId },
                data: { status: input.actionOrderStatus },
            })

            if (input.actionOrderStatus === "REJECTED") {
                await prisma.user.update({
                    where: { id: order.userId },
                    data: {
                        points: {
                            increment: order.item.price * order.quantity,
                        },
                    },
                })

                await prisma.shopItem.update({
                    where: { id: order.itemId },
                    data: {
                        stock: { increment: order.quantity },
                    },
                })
            }

            if (input.actionOrderStatus === "FULFILLED") {
                await NotificationService.send(
                    order.userId,
                    "quacky",
                    `Hey!\n\nYour order for ${order.item.name} (Quantity: ${order.quantity}) has been fulfilled!\n\nOrder ID: ${order.id}\n\nPlease ask a teacher or Staffing Member for your item if you have not yet recieved it.`
                )
            } else {
                await NotificationService.send(
                    order.userId,
                    "quacky",
                    `Your order for ${order.item.name} (Quantity: ${order.quantity}) has been rejected.\n\nOrder ID: ${order.id}\n\nYou have been refunded $${order.item.price * order.quantity}.`
                )
            }

            await Up.ingest({
                title: `Order ${input.actionOrderStatus}: ${order.item.name}`,
                description: `Order ${input.actionOrderStatus}: ${order.item.name} (Quantity: ${order.quantity}) for ${ctx.session.user.name} (${ctx.session.user.email})`,
                fields: [
                    { title: "Order ID", value: order.id },
                    { title: "Item Name", value: order.item.name },
                    { title: "Quantity", value: order.quantity.toString() },
                    { title: "Order Status", value: input.actionOrderStatus },
                    { title: "Actioned by", value: ctx.session.user.name },
                ],
                data: {
                    session: ctx.session,
                    updatedOrderStatus,
                },
            })

            return { message: "Done!" }
        }),

    ordersDelete: adminProcedure
        .meta({ description: "Delete a shop order (admin only)." })
        .input(z.object({ orderId: z.string().min(1) }))
        .mutation(async ({ ctx, input }) => {
            const order = await prisma.shopPurchase.findUnique({
                where: { id: input.orderId },
                include: { item: true, user: true },
            })

            if (!order) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Order not found",
                })
            }

            await prisma.shopPurchase.delete({
                where: { id: input.orderId },
            })

            await Up.ingest({
                title: `Order Deleted: ${order.item.name}`,
                description: `Order Deleted: ${order.item.name} (Quantity: ${order.quantity}) for ${ctx.session.user.name} (${ctx.session.user.email})`,
                fields: [
                    { title: "Order ID", value: order.id },
                    { title: "Item Name", value: order.item.name },
                    { title: "Quantity", value: order.quantity.toString() },
                    { title: "Actioned by", value: ctx.session.user.name },
                    { title: "Order Username", value: order.user.username },
                ],
                data: { session: ctx.session, order },
            })

            return { message: "Deleted order!" }
        }),

    shopItemsList: adminProcedure
        .meta({ description: "List all shop items including unavailable ones (admin only)." })
        .query(async () => {
            return prisma.shopItem.findMany({
                orderBy: [{ available: "desc" }, { createdAt: "desc" }],
            })
        }),

    shopItemsCreate: adminProcedure
        .meta({ description: "Create a new shop item (admin only)." })
        .input(shopItemSchema)
        .mutation(async ({ ctx, input }) => {
            const item = await prisma.shopItem.create({
                data: {
                    ...input,
                    addedByUserId: ctx.session.user.id,
                },
            })

            await Up.ingest({
                title: "Admin created shop item",
                description: `${ctx.session.user.name} created ${item.name}.`,
                icon: "🛒",
                category: "shop.item.created",
                fields: [
                    { title: "Item", value: item.name },
                    { title: "Price", value: item.price.toString() },
                    { title: "Stock", value: item.stock.toString() },
                    { title: "Admin", value: ctx.session.user.email },
                ],
                data: { item, adminId: ctx.session.user.id },
            })

            return item
        }),

    shopItemsUpdate: adminProcedure
        .meta({ description: "Update an existing shop item (admin only)." })
        .input(
            shopItemSchema.partial().extend({
                id: z.string().min(1),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { id, ...data } = input
            const item = await prisma.shopItem.update({
                where: { id },
                data,
            })

            await Up.ingest({
                title: "Admin updated shop item",
                description: `${ctx.session.user.name} updated ${item.name}.`,
                icon: "🛠️",
                category: "shop.item.updated",
                fields: [
                    { title: "Item", value: item.name },
                    { title: "Admin", value: ctx.session.user.email },
                ],
                data: {
                    item,
                    updatedFields: data,
                    adminId: ctx.session.user.id,
                },
            })

            return item
        }),

    shopItemsDelete: adminProcedure
        .meta({ description: "Delete a shop item by ID (admin only)." })
        .input(z.object({ id: z.string().min(1) }))
        .mutation(async ({ ctx, input }) => {
            const item = await prisma.shopItem.delete({
                where: { id: input.id },
            })

            await Up.ingest({
                title: "Admin deleted shop item",
                description: `${ctx.session.user.name} deleted ${item.name}.`,
                icon: "🗑️",
                category: "shop.item.deleted",
                fields: [
                    { title: "Item", value: item.name },
                    { title: "Admin", value: ctx.session.user.email },
                ],
                data: { item, adminId: ctx.session.user.id },
            })

            return item
        }),
})
