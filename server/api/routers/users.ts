import { TRPCError } from "@trpc/server"
import { z } from "zod"

import { xp } from "@/lib/var"
import { Admin } from "@/server/administration"
import { protectedProcedure, publicProcedure, router } from "@/server/api/trpc"
import { follow, unfollow } from "@/server/follow"
import { chat } from "@/server/helpers"
import { send } from "@/server/notification"
import { prisma } from "@/server/prisma"
import { Up } from "@/server/upstream"
import { getUser } from "@/server/users"

export const usersRouter = router({
    byHandle: protectedProcedure
        .meta({ description: "Get a user's profile by handle." })
        .input(z.object({ handle: z.string().trim().min(1) }))
        .query(async ({ input }) => {
            const user = await prisma.user.findUnique({
                where: { username: input.handle },
                include: {
                    following: {
                        select: {
                            follow: { select: { username: true } },
                        },
                    },
                    followers: {
                        select: {
                            user: { select: { username: true } },
                        },
                    },
                },
            })

            if (!user) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "User not found",
                })
            }

            if (user.banned) {
                return {
                    id: "Deleted User",
                    name: "Deleted User",
                    username: "Deleted User",
                    banned: true as const,
                    private: false as const,
                }
            }

            if (user.private) {
                return {
                    id: user.id,
                    name: user.name,
                    username: user.username,
                    image: user.image,
                    bannerImage: user.bannerImage,
                    createdAt: user.createdAt.toISOString(),
                    verified: user.verified,
                    private: true as const,
                    role: user.role,
                    banned: false as const,
                }
            }

            return {
                id: user.id,
                name: user.name,
                username: user.username,
                image: user.image,
                createdAt: user.createdAt.toISOString(),
                verified: user.verified,
                private: false as const,
                xp: user.xp,
                points: user.points,
                role: user.role,
                bio: user.bio,
                website: user.website,
                location: user.location,
                bannerImage: user.bannerImage,
                pronouns: user.pronoun,
                banned: false as const,
                following: user.following.map(({ follow: f }) => f.username),
                followers: user.followers.map(({ user: u }) => u.username),
            }
        }),

    mentions: protectedProcedure
        .meta({ description: "Search unbanned users by username prefix/substring for mentions or recipient pickers." })
        .input(
            z
                .object({
                    query: z.string().trim().max(50).default(""),
                })
                .optional()
        )
        .query(async ({ input }) => {
            const query = input?.query ?? ""

            const users = await prisma.user.findMany({
                where: {
                    username: {
                        contains: query,
                        mode: "insensitive",
                    },
                    banned: false,
                },
                select: {
                    id: true,
                    name: true,
                    username: true,
                    image: true,
                    verified: true,
                    role: true,
                },
                orderBy: { username: "asc" },
                take: 8,
            })

            return { users }
        }),

    suggested: protectedProcedure
        .meta({ description: "Get up to 3 suggested users to follow." })
        .query(async ({ ctx }) => {
            const users = await prisma.user.findMany({
                where: {
                    id: { not: ctx.session.user.id },
                    banned: false,
                    followers: {
                        none: { userId: ctx.session.user.id },
                    },
                },
                orderBy: [
                    { followers: { _count: "desc" } },
                    { xp: "desc" },
                    { createdAt: "desc" },
                ],
                take: 3,
                select: {
                    id: true,
                    name: true,
                    username: true,
                    image: true,
                    verified: true,
                    role: true,
                    bio: true,
                    _count: { select: { followers: true } },
                },
            })

            return users.map((user) => ({
                id: user.id,
                name: user.name,
                username: user.username,
                image: user.image,
                verified: user.verified,
                role: user.role,
                bio: user.bio,
                followers: user._count.followers,
            }))
        }),

    followers: publicProcedure
        .meta({ description: "List followers of a public user, with optional search." })
        .input(
            z.object({
                handle: z.string().trim().min(1),
                search: z.string().trim().optional(),
            })
        )
        .query(async ({ input }) => {
            const search = input.search?.toLowerCase() ?? ""

            const user = await prisma.user.findUnique({
                where: { username: input.handle },
                select: { id: true, private: true },
            })

            if (!user) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "User not found",
                })
            }

            if (user.private) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "This profile is private",
                })
            }

            const follows = await prisma.follow.findMany({
                where: {
                    followId: user.id,
                    user: {
                        banned: false,
                        ...(search
                            ? {
                                  OR: [
                                      {
                                          name: {
                                              contains: search,
                                              mode: "insensitive",
                                          },
                                      },
                                      {
                                          username: {
                                              contains: search,
                                              mode: "insensitive",
                                          },
                                      },
                                  ],
                              }
                            : {}),
                    },
                },
                select: {
                    user: {
                        select: {
                            name: true,
                            username: true,
                            image: true,
                            verified: true,
                            role: true,
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
            })

            return { users: follows.map((f) => f.user) }
        }),

    following: publicProcedure
        .meta({ description: "List accounts followed by a public user, with optional search." })
        .input(
            z.object({
                handle: z.string().trim().min(1),
                search: z.string().trim().optional(),
            })
        )
        .query(async ({ input }) => {
            const search = input.search?.toLowerCase() ?? ""

            const user = await prisma.user.findUnique({
                where: { username: input.handle },
                select: { id: true, private: true },
            })

            if (!user) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "User not found",
                })
            }

            if (user.private) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "This profile is private",
                })
            }

            const follows = await prisma.follow.findMany({
                where: {
                    userId: user.id,
                    follow: {
                        banned: false,
                        ...(search
                            ? {
                                  OR: [
                                      {
                                          name: {
                                              contains: search,
                                              mode: "insensitive",
                                          },
                                      },
                                      {
                                          username: {
                                              contains: search,
                                              mode: "insensitive",
                                          },
                                      },
                                  ],
                              }
                            : {}),
                    },
                },
                select: {
                    follow: {
                        select: {
                            name: true,
                            username: true,
                            image: true,
                            verified: true,
                            role: true,
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
            })

            return { users: follows.map((f) => f.follow) }
        }),

    follow: protectedProcedure
        .meta({ description: "Follow a user by handle." })
        .input(z.object({ handle: z.string().trim().min(1) }))
        .mutation(async ({ ctx, input }) => {
            const user = await prisma.user.findUnique({
                where: { username: input.handle },
                select: { id: true },
            })

            if (!user) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "User not found",
                })
            }

            if (user.id === ctx.session.user.id) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Cannot follow yourself",
                })
            }

            await follow(ctx.session.user.id, user.id)

            return { following: true }
        }),

    unfollow: protectedProcedure
        .meta({ description: "Unfollow a user by handle." })
        .input(z.object({ handle: z.string().trim().min(1) }))
        .mutation(async ({ ctx, input }) => {
            const user = await prisma.user.findUnique({
                where: { username: input.handle },
                select: { id: true },
            })

            if (!user) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "User not found",
                })
            }

            await unfollow(ctx.session.user.id, user.id)

            return { following: false }
        }),

    report: protectedProcedure
        .meta({ description: "Report a user profile for moderation review." })
        .input(
            z.object({
                handle: z.string().trim().min(1),
                reason: z.string().trim().min(1, "Reason is required"),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const user = await getUser(input.handle)

            if (!user) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "User not found",
                })
            }

            const output = await chat([
                {
                    role: "system",
                    content: `
You are a content moderation system for Quacky.

Determine whether a user's profile violates Quacky's rules.

A profile is inappropriate if it contains or promotes:
- hate speech
- threats or encouragement of violence
- harassment or targeted bullying
- explicit sexual content
- spam, scams, or impersonation
- encouragement of self-harm
- private personal information (doxxing)
- usernames or profile text designed primarily to abuse or evade moderation
- anything else that is not G-rated or appropriate for a school environment.

The report reason is only additional context. Do NOT assume the report is truthful.
However, with your own judgement, if the user's details are inappropriate, return true even if the report reason is not entirely accurate.

Return ONLY valid JSON.

{
  "is_inappropriate": boolean,
  "reason": string
}

If the profile is acceptable, return:

{
  "is_inappropriate": false,
  "reason": ""
}
`,
                },
                {
                    role: "user",
                    content: `
Display name: ${user.name}
Username: ${user.username}
Bio: ${user.bio ?? ""}
Pronouns: ${user.pronoun ?? ""}
Location: ${user.location ?? ""}
Website: ${user.website ?? ""}

Reporter's reason:
${input.reason}
`,
                },
            ])

            const result = JSON.parse(output) as {
                is_inappropriate: boolean
                reason: string
            }

            if (result.is_inappropriate) {
                await Admin.banUser(user.id, result.reason)
            }

            await send(
                ctx.session.user.id,
                "quacky",
                `Hello, ${ctx.session.user.name}. \n\nThank you for reporting abuse content you thought was inappropriate by **${user.username}**.\n\nYour report has been submitted and will be reviewed by an administrator shortly.\n\nYou have earned **${xp.report} XP** for your contribution to keeping the community safe.\n\n Thankyou!`
            )

            await Up.ingest({
                title: "User Report - " + user.username,
                icon: "🚩",
                description: `A new report has been submitted for user ${user.username}. Reason: ${input.reason}`,
                fields: [
                    { title: "User ID", value: user.id },
                    { title: "User Email", value: user.email },
                    {
                        title: "Auto Banned?",
                        value: result.is_inappropriate ? "Yes" : "No",
                    },
                    { title: "AI Reason", value: result.reason },
                ],
                data: {
                    offender: user,
                    reportReason: input.reason,
                    ai: {
                        isInappropriate: result.is_inappropriate,
                        reason: result.reason,
                    },
                },
                actions: [
                    {
                        title: "View User",
                        variant: "primary",
                        url: `https://quacky.space/@${user.username}`,
                    },
                ],
            })

            return { message: "Report submitted successfully" }
        }),
})
