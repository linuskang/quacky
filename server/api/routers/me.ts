import { TRPCError } from "@trpc/server"
import { z } from "zod"

import { env } from "@/env"
import { xp } from "@/lib/var"
import { protectedProcedure, router } from "@/server/api/trpc"
import { fetchBookmarks } from "@/server/bookmarks"
import { checkIn, getCheckInSummary, hasCheckedIn } from "@/server/check-in"
import { Email } from "@/server/helpers"
import { sendPushNotification } from "@/server/notification"
import { fetchNotifications } from "@/server/notifications"
import { prisma } from "@/server/prisma"
import { Up } from "@/server/upstream"
import { addXP } from "@/server/users"

function escapeHtml(value: string) {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;")
}

export const meRouter = router({
    get: protectedProcedure
        .meta({
            description:
                "Get the signed-in user's check-in status, permissions, unread counts, streak, and point balance.",
        })
        .query(async ({ ctx }) => {
            const userId = ctx.session.user.id

            const [
                hasCheckedInToday,
                streak,
                unreadNotifications,
                unreadDms,
                unreadFuzzies,
                user,
            ] = await Promise.all([
                hasCheckedIn(userId),
                getCheckInSummary(userId),
                prisma.notification.count({
                    where: { userId, read: false },
                }),
                prisma.dm.count({
                    where: { receiverId: userId, read: false },
                }),
                prisma.fuzzy.count({
                    where: { receiverId: userId, read: false },
                }),
                prisma.user.findUnique({
                    where: { id: userId },
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true,
                        bio: true,
                        points: true,
                        unlockedPosting: true,
                        unlockedCommenting: true,
                        unlockedDms: true,
                        unlockedFuzzies: true,
                        unlockedProfiles: true,
                    },
                }),
            ])

            if (!user) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "User not found",
                })
            }

            return {
                id: user.id,
                name: user.name,
                username: user.username,
                image: user.image,
                bio: user.bio,
                hasCheckedIn: hasCheckedInToday,
                canPost: user.unlockedPosting,
                canComment: user.unlockedCommenting,
                canDm: user.unlockedDms,
                canFuzzy: user.unlockedFuzzies,
                canEditProfile: user.unlockedProfiles,
                unreads: {
                    notifications: unreadNotifications,
                    dms: unreadDms,
                    fuzzies: unreadFuzzies,
                },
                streak,
                balance: user.points,
            }
        }),

    updateBio: protectedProcedure
        .meta({ description: "Update the signed-in user's bio." })
        .input(
            z.object({
                bio: z.string().trim().max(160),
            })
        )
        .mutation(async ({ ctx, input }) => {
            return prisma.user.update({
                where: { id: ctx.session.user.id },
                data: { bio: input.bio || null },
                select: { bio: true },
            })
        }),

    checkIn: protectedProcedure
        .meta({ description: "Submit today's wellbeing daily check-in." })
        .input(
            z.object({
                wellbeing: z.number().int().min(1).max(5),
                happiness: z.number().int().min(1).max(5),
                stress: z.number().int().min(1).max(5),
                sleep: z.number().int().min(1).max(5),
                energy: z.number().int().min(1).max(5),
                assistance: z.boolean(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const hasCheckedInToday = await hasCheckedIn(ctx.session.user.id)

            if (hasCheckedInToday) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "You have already checked in today",
                })
            }

            const res = await checkIn({
                userId: ctx.session.user.id,
                date: new Date(),
                wellbeing: input.wellbeing,
                happiness: input.happiness,
                stress: input.stress,
                sleep: input.sleep,
                energy: input.energy,
                assistance: input.assistance,
            })

            await addXP(ctx.session.user.username, xp.checkIn)

            if (res.assistance) {
                await Up.ingest({
                    title: "Student requested a talk with a staff member",
                    icon: "🛫",
                    fields: [
                        { title: "Name", value: ctx.session.user.name },
                        { title: "Email", value: ctx.session.user.email },
                    ],
                    actions: [
                        {
                            title: "Send Email",
                            url: `mailto:${ctx.session.user.email}?subject=Student%20Check-In%20Assistance&body=Hello%20${ctx.session.user.name},`,
                            variant: "primary",
                        },
                        {
                            title: "View in Quacky",
                            url: `${env.BETTER_AUTH_URL}/@${ctx.session.user.username}`,
                            variant: "secondary",
                        },
                    ],
                })
            }

            return { message: "Thanks for checking in!" }
        }),

    parentEmailGet: protectedProcedure
        .meta({ description: "Get the signed-in user's configured parent email." })
        .query(async ({ ctx }) => {
            const user = await prisma.user.findUnique({
                where: { id: ctx.session.user.id },
                select: { parentEmail: true },
            })

            return { parentEmail: user?.parentEmail ?? null }
        }),

    parentEmailSet: protectedProcedure
        .meta({ description: "Set a parent email and send a notification email." })
        .input(
            z.object({
                parentEmail: z.email("Please enter a valid parent email address."),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const parentEmail = input.parentEmail.trim().toLowerCase()
            const user = await prisma.user.update({
                where: { id: ctx.session.user.id },
                data: { parentEmail },
                select: { name: true, username: true },
            })

            const studentName = escapeHtml(user.name)
            const username = escapeHtml(user.username)
            const { error } = await Email.emails.send({
                from: env.EMAIL_FROM,
                to: parentEmail,
                subject: `${user.name} selected you as their parent on Quacky`,
                html: `
                    <p>Hello,</p>
                    <p>${studentName} (@${username}) selected you as their parent on Quacky.</p>
                    <p>You will receive a weekly digest with an overview of what they have been doing on the platform.</p>
                    <p>If you believe this was sent in error, please contact the Quacky administrators.</p>
                `,
            })

            if (error) {
                throw new TRPCError({
                    code: "BAD_GATEWAY",
                    message:
                        "The parent email was saved, but the notification could not be sent.",
                })
            }

            return { parentEmail }
        }),

    bookmarks: protectedProcedure
        .meta({ description: "Fetch the signed-in user's bookmarked posts." })
        .query(async ({ ctx }) => {
            return fetchBookmarks({ userId: ctx.session.user.id })
        }),

    notifications: protectedProcedure
        .meta({ description: "Fetch the signed-in user's notifications." })
        .query(async ({ ctx }) => {
            const notifications = await fetchNotifications({
                userId: ctx.session.user.id,
            })

            return { notifications }
        }),

    pushSubscribe: protectedProcedure
        .meta({ description: "Register a Web Push subscription for the signed-in user." })
        .input(
            z.object({
                endpoint: z.string().url(),
                keys: z.object({
                    auth: z.string().min(1),
                    p256dh: z.string().min(1),
                }),
            })
        )
        .mutation(async ({ ctx, input }) => {
            await prisma.pushSubscription.upsert({
                where: { endpoint: input.endpoint },
                update: { userId: ctx.session.user.id },
                create: {
                    userId: ctx.session.user.id,
                    endpoint: input.endpoint,
                    auth: input.keys.auth,
                    p256dh: input.keys.p256dh,
                },
            })

            return { success: true }
        }),

    pushUnsubscribe: protectedProcedure
        .meta({ description: "Remove a Web Push subscription for the signed-in user." })
        .input(
            z.object({
                endpoint: z.string().min(1),
            })
        )
        .mutation(async ({ ctx, input }) => {
            await prisma.pushSubscription.deleteMany({
                where: {
                    endpoint: input.endpoint,
                    userId: ctx.session.user.id,
                },
            })

            return { success: true }
        }),

    pushTest: protectedProcedure
        .meta({ description: "Send a test push notification to the signed-in user." })
        .input(
            z
                .object({
                    message: z
                        .string()
                        .trim()
                        .min(1)
                        .default("This is a test notification from Quacky!"),
                })
                .optional()
        )
        .mutation(async ({ ctx, input }) => {
            return sendPushNotification(ctx.session.user.id, {
                title: "Quacky",
                body:
                    input?.message ??
                    "This is a test notification from Quacky!",
            })
        }),
})
