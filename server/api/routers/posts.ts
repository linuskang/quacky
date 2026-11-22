import { TRPCError } from "@trpc/server"
import { z } from "zod"

import { env } from "@/env"
import { extractHashtags } from "@/lib/hashtags"
import { xp } from "@/lib/var"
import { Admin } from "@/server/administration"
import Algorithms from "@/server/algo/rankings"
import {
    postingProcedure,
    protectedProcedure,
    router,
} from "@/server/api/trpc"
import { getCommentsByPostId } from "@/server/comment"
import { chat, NotificationService } from "@/server/helpers"
import { sendMentionNotifications } from "@/server/mentions"
import { send } from "@/server/notification"
import {
    fetchPostsByUserIdPage,
    fetchPostsPage,
    getPost,
} from "@/server/posts"
import { prisma } from "@/server/prisma"
import { Up } from "@/server/upstream"
import { addXP, removeXP } from "@/server/users"
import type { Attachment, Post } from "@/types"

function withFollowing<T extends { id?: string }>(
    user: T,
    followingIds: Set<string>
) {
    return {
        ...user,
        following: user.id ? followingIds.has(user.id) : false,
    }
}

export const postsRouter = router({
    feed: protectedProcedure
        .meta({
            description:
                "Fetch a paginated post feed (recent, following, popular, or foryou), optionally filtered by hashtag.",
        })
        .input(
            z
                .object({
                    tab: z
                        .enum(["recent", "following", "popular", "foryou"])
                        .default("recent"),
                    hashtag: z.string().trim().min(1).nullish(),
                    limit: z.number().int().min(1).max(50).default(15),
                    cursor: z.string().nullish(),
                })
                .optional()
        )
        .query(async ({ ctx, input }) => {
            const tab = input?.tab ?? "recent"
            const limit = input?.limit ?? 15
            const cursor = input?.cursor ?? null
            const userId = ctx.session.user.id

            if (tab === "following") {
                return Algorithms.followingPage(userId, limit, cursor)
            }
            if (tab === "popular" || tab === "foryou") {
                return Algorithms.popularPage(userId, limit, cursor)
            }

            return fetchPostsPage({
                userId,
                hashtag: input?.hashtag ?? null,
                limit,
                cursor,
            })
        }),

    byUser: protectedProcedure
        .meta({
            description: "Fetch paginated posts authored by a user handle.",
        })
        .input(
            z.object({
                handle: z.string().trim().min(1),
                limit: z.number().int().min(1).max(50).default(15),
                cursor: z.string().nullish(),
            })
        )
        .query(async ({ ctx, input }) => {
            const targetUser = await prisma.user.findUnique({
                where: { username: input.handle },
                select: {
                    id: true,
                    banned: true,
                    private: true,
                },
            })

            if (!targetUser || targetUser.banned) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "User not found",
                })
            }

            if (targetUser.private && targetUser.id !== ctx.session.user.id) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "This profile is private",
                })
            }

            return fetchPostsByUserIdPage({
                userId: targetUser.id,
                viewerId: ctx.session.user.id,
                limit: input.limit,
                cursor: input.cursor ?? null,
            })
        }),

    byId: protectedProcedure
        .meta({
            description:
                "Get a single post with its comments and engagement state, recording a view.",
        })
        .input(
            z.object({
                id: z.string().min(1),
            })
        )
        .query(async ({ ctx, input }) => {
            const post = await getPost(input.id, ctx.session)

            if (!post) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Post not found",
                })
            }

            const postView = await prisma.postView.createMany({
                data: [
                    {
                        userId: ctx.session.user.id,
                        postId: post.id,
                    },
                ],
                skipDuplicates: true,
            })

            if (postView.count === 1) {
                await prisma.post.update({
                    where: { id: post.id },
                    data: { views: { increment: 1 } },
                })
            }

            const comments = await getCommentsByPostId(post.id)

            const relevantUserIds = Array.from(
                new Set(
                    [
                        post.author.id,
                        ...comments.map((comment) => comment.author.id),
                    ].filter(Boolean)
                )
            )

            const following = await prisma.follow.findMany({
                where: {
                    userId: ctx.session.user.id,
                    followId: { in: relevantUserIds },
                },
                select: { followId: true },
            })
            const followingIds = new Set(
                following.map((follow) => follow.followId)
            )

            const res: Post = {
                id: post.id,
                author: withFollowing(post.author, followingIds),
                content: post.content,

                repostOfId: post.repostOfId,
                repostOf: post.repostOf
                    ? {
                          id: post.repostOf.id,
                          author: withFollowing(
                              post.repostOf.author,
                              followingIds
                          ),
                          content: post.repostOf.content,
                          flagged: post.repostOf.flagged,
                          edited: post.repostOf.edited,
                          createdAt: post.repostOf.createdAt.toISOString(),
                          updatedAt: post.repostOf.updatedAt.toISOString(),
                          views: post.repostOf.views,
                          attachments: post.repostOf.attachments.map(
                              (attachment: Attachment) => ({
                                  name: attachment.name,
                                  url: attachment.url,
                                  type: attachment.type,
                              })
                          ),
                      }
                    : null,

                flagged: post.flagged,
                edited: post.edited,
                createdAt: post.createdAt.toISOString(),
                updatedAt: post.updatedAt.toISOString(),
                views: post.views + postView.count,

                likes: post._count.likes,
                reposts: post._count.reposts,
                comments: post._count.comments,

                liked: post.likes.length > 0,
                reposted: post.reposts.length > 0,
                commented: post.comments.length > 0,
                bookmarked: post.bookmarks.length > 0,

                attachments: post.attachments.map((attachment) => ({
                    name: attachment.name,
                    url: attachment.url,
                    type: attachment.type,
                })),
                postComments: comments.map((c) => ({
                    id: c.id,
                    postId: c.postId,
                    author: withFollowing(c.author, followingIds),
                    content: c.content,
                    flagged: c.flagged,
                    createdAt: c.createdAt.toISOString(),
                    updatedAt: c.updatedAt.toISOString(),
                })),
            }

            return res
        }),

    create: postingProcedure
        .meta({ description: "Create a new post with up to 2 attachments." })
        .input(
            z.object({
                content: z.string().trim().min(1, "Invalid content").max(400),
                attachments: z
                    .array(
                        z.object({
                            name: z.string().min(1),
                            url: z.string().min(1),
                            type: z.string().nullable().optional(),
                        })
                    )
                    .max(2, "You can only attach up to 2 files")
                    .default([]),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const hashtags = extractHashtags(input.content)

            const post = await prisma.post.create({
                data: {
                    id: crypto.randomUUID(),
                    authorId: ctx.session.user.id,
                    content: input.content,
                    postViews: {
                        create: { userId: ctx.session.user.id },
                    },
                    attachments: {
                        create: input.attachments.map((a) => ({
                            name: a.name,
                            url: a.url,
                            type: a.type ?? null,
                        })),
                    },
                    hashtags: {
                        create: hashtags.map((tag) => ({ tag })),
                    },
                },
                select: { id: true },
            })

            await sendMentionNotifications({
                content: input.content,
                actorId: ctx.session.user.id,
                actorUsername: ctx.session.user.username,
                message: `mentioned you in a [post](${env.BETTER_AUTH_URL}/post/${post.id})`,
            })

            await addXP(ctx.session.user.username, xp.post)

            return { success: true, id: post.id }
        }),

    update: protectedProcedure
        .meta({ description: "Edit the content of a post owned by the signed-in user." })
        .input(
            z.object({
                id: z.string().min(1),
                content: z.string().trim().min(1, "Content is required").max(400),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const post = await prisma.post.findUnique({
                where: { id: input.id },
            })

            if (!post) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Post not found",
                })
            }

            if (post.authorId !== ctx.session.user.id) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "You are not the author of this post",
                })
            }

            if (post.flagged) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Post is flagged",
                })
            }

            const res = await prisma.post.update({
                where: { id: input.id },
                data: {
                    content: input.content,
                    edited: true,
                },
            })

            return { success: true, res }
        }),

    delete: protectedProcedure
        .meta({ description: "Delete a post (owner or admin)." })
        .input(
            z.object({
                id: z.string().min(1),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const post = await prisma.post.findUnique({
                where: { id: input.id },
                include: {
                    repostOf: {
                        select: { id: true, authorId: true },
                    },
                },
            })

            if (!post) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Post not found",
                })
            }

            if (
                post.authorId !== ctx.session.user.id &&
                ctx.session.user.role !== "admin"
            ) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "You are not the author of this post",
                })
            }

            if (post.flagged && ctx.session.user.role !== "admin") {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Post is flagged",
                })
            }

            const res = await prisma.post.delete({
                where: { id: input.id },
            })

            if (post.repostOf) {
                await NotificationService.removeEngagement(
                    post.content ? "quote" : "repost",
                    post.repostOf.authorId,
                    post.authorId,
                    post.repostOf.id
                )
            }

            await NotificationService.removeEngagementsForPost(post.id)
            await removeXP(ctx.session.user.username, xp.post)

            return { success: true, res }
        }),

    like: protectedProcedure
        .meta({ description: "Like a post." })
        .input(z.object({ id: z.string().min(1) }))
        .mutation(async ({ ctx, input }) => {
            const post = await prisma.post.findFirst({
                where: {
                    id: input.id,
                    flagged: false,
                    author: { banned: false },
                },
            })

            if (!post) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Post not found",
                })
            }

            const res = await prisma.like.createMany({
                data: [{ userId: ctx.session.user.id, postId: input.id }],
                skipDuplicates: true,
            })

            if (res.count === 1) {
                await NotificationService.sendEngagement(
                    "like",
                    post.authorId,
                    ctx.session.user.id,
                    post.id
                )
            }

            await addXP(ctx.session.user.username, xp.like)

            return { success: true, liked: true }
        }),

    unlike: protectedProcedure
        .meta({ description: "Remove a like from a post." })
        .input(z.object({ id: z.string().min(1) }))
        .mutation(async ({ ctx, input }) => {
            const post = await prisma.post.findFirst({
                where: {
                    id: input.id,
                    flagged: false,
                    author: { banned: false },
                },
            })

            if (!post) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Post not found",
                })
            }

            const res = await prisma.like.deleteMany({
                where: { userId: ctx.session.user.id, postId: input.id },
            })

            if (res.count === 1) {
                await NotificationService.removeEngagement(
                    "like",
                    post.authorId,
                    ctx.session.user.id,
                    post.id
                )
            }

            await removeXP(ctx.session.user.username, xp.like)

            return { success: true, liked: false }
        }),

    bookmark: protectedProcedure
        .meta({ description: "Bookmark a post." })
        .input(z.object({ id: z.string().min(1) }))
        .mutation(async ({ ctx, input }) => {
            const post = await prisma.post.findUnique({
                where: { id: input.id },
            })

            if (!post) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Post not found",
                })
            }

            const existing = await prisma.bookmark.findUnique({
                where: {
                    userId_postId: {
                        userId: ctx.session.user.id,
                        postId: input.id,
                    },
                },
            })

            if (existing) {
                return { success: true, bookmarked: true }
            }

            await prisma.bookmark.create({
                data: {
                    userId: ctx.session.user.id,
                    postId: input.id,
                },
            })

            return { success: true, bookmarked: true }
        }),

    unbookmark: protectedProcedure
        .meta({ description: "Remove a post from bookmarks." })
        .input(z.object({ id: z.string().min(1) }))
        .mutation(async ({ ctx, input }) => {
            const post = await prisma.post.findUnique({
                where: { id: input.id },
            })

            if (!post) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Post not found",
                })
            }

            await prisma.bookmark.deleteMany({
                where: {
                    userId: ctx.session.user.id,
                    postId: input.id,
                },
            })

            return { success: true, bookmarked: false }
        }),

    repost: protectedProcedure
        .meta({ description: "Repost an existing post." })
        .input(z.object({ postId: z.string().min(1) }))
        .mutation(async ({ ctx, input }) => {
            const target = await prisma.post.findFirst({
                where: {
                    id: input.postId,
                    flagged: false,
                    author: { banned: false },
                },
            })

            if (!target) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Post not found",
                })
            }

            const post = await prisma.post.create({
                data: {
                    authorId: ctx.session.user.id,
                    repostOfId: input.postId,
                    postViews: {
                        create: { userId: ctx.session.user.id },
                    },
                },
            })

            await NotificationService.sendEngagement(
                "repost",
                target.authorId,
                ctx.session.user.id,
                target.id
            )

            await addXP(ctx.session.user.username, xp.post)

            return { success: true, post }
        }),

    quote: protectedProcedure
        .meta({ description: "Quote-repost an existing post with commentary." })
        .input(
            z.object({
                postId: z.string().min(1),
                content: z.string().trim().min(1).max(400),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const target = await prisma.post.findFirst({
                where: {
                    id: input.postId,
                    flagged: false,
                    author: { banned: false },
                },
            })

            if (!target) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Post not found",
                })
            }

            const post = await prisma.post.create({
                data: {
                    authorId: ctx.session.user.id,
                    repostOfId: input.postId,
                    content: input.content,
                    postViews: {
                        create: { userId: ctx.session.user.id },
                    },
                    hashtags: {
                        create: extractHashtags(input.content).map((tag) => ({
                            tag,
                        })),
                    },
                },
            })

            await NotificationService.sendEngagement(
                "quote",
                target.authorId,
                ctx.session.user.id,
                target.id
            )

            await addXP(ctx.session.user.username, xp.post)

            return { success: true, post }
        }),

    report: protectedProcedure
        .meta({ description: "Report a post for moderation review." })
        .input(
            z.object({
                id: z.string().min(1),
                reason: z.string().trim().min(1, "Reason is required"),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const post = await getPost(input.id, ctx.session)

            if (!post) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Post not found",
                })
            }

            const output = await chat([
                {
                    role: "system",
                    content: `
You are a content moderation system for Quacky.

Determine whether a user post violates Quacky's rules.

A post is inappropriate if it contains or promotes:
- hate speech
- bullying or harassment
- explicit sexual content
- spam, scams, or impersonation
- encouragement of self-harm
- private personal information (doxxing)
- usernames or profile text designed primarily to abuse or evade moderation
- threats or encouragement of violence
- anything else that is not G-rated or appropriate for a school environment.

The report reason is only additional context. Do NOT assume the report is truthful.
However, with your own judgement, if the user's post is inappropriate, return true even if the report reason is not entirely accurate.

With your AI report reason, please be mindful that you do not include the offensive content in your response.
Instead, provide a short consise summary of what rule was broken, and a brief explanation without giving anything inappropriate on what was flagged.

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
Post content: ${post.content}
Author: ${post.author.username}

Reporter's reason:
${input.reason}
`,
                },
            ])

            const result = JSON.parse(output) as {
                is_inappropriate: boolean
                reason: string
            }

            const simulationPost = await prisma.simulationPost.findUnique({
                where: { postId: post.id },
                select: { groundTruth: true },
            })

            if (result.is_inappropriate) {
                await Admin.flagPost(post.id)
                await NotificationService.send(
                    post.authorId,
                    "quacky",
                    `Hello, ${post.author.name}. \n\nYour [post](${env.BETTER_AUTH_URL}/post/${post.id}) which you made on **${new Date().toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}** has been taken down due to a violation of our [Community Guidelines](https://quacky.space/terms).\n\nReason given: **${result.reason}**\n\nIf you believe this is a mistake, please contact an school administrator.`
                )
            }

            if (
                simulationPost?.groundTruth === "unsafe" &&
                result.is_inappropriate === true
            ) {
                try {
                    await prisma.$transaction(async (transaction) => {
                        await transaction.simulationReportReward.create({
                            data: {
                                postId: post.id,
                                reporterId: ctx.session.user.id,
                                amount: env.SIMULATION_REWARD_POINTS,
                            },
                        })

                        await transaction.user.update({
                            where: { id: ctx.session.user.id },
                            data: {
                                points: {
                                    increment: env.SIMULATION_REWARD_POINTS,
                                },
                            },
                        })
                    })

                    await NotificationService.send(
                        ctx.session.user.id,
                        "quacky",
                        `You correctly identified unsafe content and earned **${env.SIMULATION_REWARD_POINTS} points** for helping keep the community safe.`
                    )
                } catch (error) {
                    if ((error as { code?: string }).code !== "P2002") {
                        throw error
                    }
                }
            }

            await addXP(ctx.session.user.username, xp.report)

            await send(
                ctx.session.user.id,
                "quacky",
                `Hello, ${ctx.session.user.name}. \n\nThank you for reporting abuse content you thought was inappropriate by **${post.author.username}**.\n\nYour report has been submitted and will be reviewed by an administrator shortly.\n\nYou have earned **${xp.report} XP** for your contribution to keeping the community safe.\n\n Thankyou!`
            )

            await Up.ingest({
                title: "Post Report - " + post.id,
                icon: "🚩",
                description: `A new report has been submitted for post ${post.id}. Reason: ${input.reason}`,
                fields: [
                    { title: "Author Username", value: post.author.username },
                    { title: "Author ID", value: post.authorId },
                    {
                        title: "Auto Flagged?",
                        value: result.is_inappropriate ? "Yes" : "No",
                    },
                    { title: "AI Reason", value: result.reason },
                ],
                data: {
                    offender: post,
                    reportReason: input.reason,
                    ai: {
                        isInappropriate: result.is_inappropriate,
                        reason: result.reason,
                    },
                },
                actions: [
                    {
                        title: "View Post",
                        variant: "primary",
                        url: `https://quacky.space/post/${post.id}`,
                    },
                ],
            })

            return { success: true, message: "Report submitted successfully" }
        }),
})
