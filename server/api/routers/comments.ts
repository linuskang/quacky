import { TRPCError } from "@trpc/server"
import { z } from "zod"

import { env } from "@/env"
import { xp } from "@/lib/var"
import { Admin } from "@/server/administration"
import { protectedProcedure, router } from "@/server/api/trpc"
import {
    deleteComment,
    getCommentById,
    getCommentsByPostId,
} from "@/server/comment"
import { askAi, NotificationService } from "@/server/helpers"
import { sendMentionNotifications } from "@/server/mentions"
import { send } from "@/server/notification"
import { getPost } from "@/server/posts"
import { prisma } from "@/server/prisma"
import { Up } from "@/server/upstream"
import { addXP, removeXP } from "@/server/users"
import { Views } from "@/server/views"

export const commentsRouter = router({
    byId: protectedProcedure
        .meta({
            description:
                "Get a comment, its parent post, sibling comments, and relevant users.",
        })
        .input(z.object({ id: z.string().min(1) }))
        .query(async ({ ctx, input }) => {
            const comment = await getCommentById(input.id)

            if (!comment) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Comment not found",
                })
            }

            const post = await getPost(comment.postId, ctx.session)

            if (!post) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Post not found",
                })
            }

            const comments = await getCommentsByPostId(post.id)
            const remainingComments = comments.filter(
                (c) => c.id !== comment.id
            )

            const usersById = new Map(
                [
                    post.author,
                    comment.author,
                    ...(post.repostOf ? [post.repostOf.author] : []),
                    ...remainingComments.map((item) => item.author),
                ].map((user) => [
                    user.id,
                    {
                        id: user.id,
                        name: user.name,
                        username: user.username,
                        image: user.image,
                        verified: user.verified,
                        role: user.role,
                    },
                ])
            )

            const [liked, commented, bookmarked, following, reposted] =
                await Promise.all([
                    prisma.like.findFirst({
                        where: {
                            userId: ctx.session.user.id,
                            postId: post.id,
                        },
                    }),
                    prisma.comment.findFirst({
                        where: {
                            authorId: ctx.session.user.id,
                            postId: post.id,
                        },
                    }),
                    prisma.bookmark.findFirst({
                        where: {
                            userId: ctx.session.user.id,
                            postId: post.id,
                        },
                    }),
                    prisma.follow.findMany({
                        where: {
                            userId: ctx.session.user.id,
                            followId: { in: [...usersById.keys()] },
                        },
                        select: { followId: true },
                    }),
                    prisma.post.findFirst({
                        where: {
                            authorId: ctx.session.user.id,
                            repostOfId: post.id,
                        },
                    }),
                ])

            const followingIds = new Set(
                following.map((item) => item.followId)
            )
            const relevantUsers = [...usersById.values()].map((user) => ({
                ...user,
                following: followingIds.has(user.id),
            }))

            await Views.add(post.id, ctx.session.user.id)

            return {
                relevantUsers,
                comment: {
                    id: comment.id,
                    postId: comment.postId,
                    content: comment.content,
                    flagged: comment.flagged,
                    createdAt: comment.createdAt.toISOString(),
                    updatedAt: comment.updatedAt.toISOString(),
                    post: {
                        id: post.id,
                        author: {
                            id: post.author.id,
                            name: post.author.name,
                            username: post.author.username,
                            image: post.author.image,
                            verified: post.author.verified,
                            role: post.author.role,
                        },
                        content: post.content,
                        repostOfId: post.repostOfId,
                        repostOf: post.repostOf
                            ? {
                                  id: post.repostOf.id,
                                  author: {
                                      id: post.repostOf.author.id,
                                      name: post.repostOf.author.name,
                                      username: post.repostOf.author.username,
                                      image: post.repostOf.author.image,
                                      verified: post.repostOf.author.verified,
                                      role: post.repostOf.author.role,
                                  },
                                  content: post.repostOf.content,
                                  flagged: post.repostOf.flagged,
                                  edited: post.repostOf.edited,
                                  createdAt:
                                      post.repostOf.createdAt.toISOString(),
                                  updatedAt:
                                      post.repostOf.updatedAt.toISOString(),
                                  views: post.repostOf.views,
                                  attachments: post.repostOf.attachments,
                              }
                            : null,
                        flagged: post.flagged,
                        edited: post.edited,
                        createdAt: post.createdAt.toISOString(),
                        updatedAt: post.updatedAt.toISOString(),
                        views: post.views,
                        likes: post._count.likes,
                        reposts: post._count.reposts,
                        comments: post._count.comments,
                        liked: Boolean(liked),
                        reposted: Boolean(reposted),
                        commented: Boolean(commented),
                        bookmarked: Boolean(bookmarked),
                        attachments: post.attachments,
                    },
                    comments: remainingComments.map((c) => ({
                        ...c,
                        createdAt: c.createdAt.toISOString(),
                        updatedAt: c.updatedAt.toISOString(),
                    })),
                    author: {
                        id: comment.author.id,
                        name: comment.author.name,
                        username: comment.author.username,
                        image: comment.author.image,
                        verified: comment.author.verified,
                        role: comment.author.role,
                    },
                },
            }
        }),

    create: protectedProcedure
        .meta({ description: "Create a comment on a post." })
        .input(
            z.object({
                postId: z.string().min(1),
                content: z
                    .string()
                    .trim()
                    .min(1, "Content is required")
                    .max(100, "Invalid content length"),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const post = await prisma.post.findUnique({
                where: { id: input.postId },
            })

            if (!post) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Post not found",
                })
            }

            const comment = await prisma.comment.create({
                data: {
                    postId: input.postId,
                    authorId: ctx.session.user.id,
                    content: input.content,
                },
            })

            await NotificationService.sendEngagement(
                "comment",
                post.authorId,
                ctx.session.user.id,
                post.id
            )

            await sendMentionNotifications({
                content: input.content,
                actorId: ctx.session.user.id,
                actorUsername: ctx.session.user.username,
                message: `mentioned you in a [comment](${env.BETTER_AUTH_URL}/post/${post.id})`,
            })

            await addXP(ctx.session.user.username, xp.comment)

            return { success: true, comment }
        }),

    delete: protectedProcedure
        .meta({ description: "Delete a comment (owner or admin)." })
        .input(z.object({ id: z.string().min(1) }))
        .mutation(async ({ ctx, input }) => {
            const comment = await getCommentById(input.id)

            if (!comment) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Comment not found",
                })
            }

            if (
                comment.authorId !== ctx.session.user.id &&
                ctx.session.user.role !== "admin"
            ) {
                await Up.ingest({
                    title: "unauthorized",
                    icon: "👎",
                    data: {
                        session: ctx.session,
                        comment,
                        action: "attempted to delete comment that isnt owned by the user",
                    },
                })

                throw new TRPCError({
                    code: "FORBIDDEN",
                    message:
                        "You do not have permissions to perform this action.",
                })
            }

            if (comment.flagged && ctx.session.user.role !== "admin") {
                await Up.ingest({
                    title: "unauthorized",
                    icon: "🙈",
                    data: {
                        session: ctx.session,
                        comment,
                        action: "attempted to delete flagged comment",
                    },
                })

                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Content is flagged",
                })
            }

            await deleteComment(input.id)
            await removeXP(ctx.session.user.username, xp.comment)

            await Up.ingest({
                title: "Comment Deleted",
                icon: "🗑️",
                fields: [
                    { title: "Post ID", value: comment.postId },
                    { title: "Deleted by", value: ctx.session.user.username },
                    { title: "Comment Author", value: comment.author.username },
                    { title: "Comment Content", value: comment.content },
                ],
                data: { comment },
            })

            return { success: true, postId: comment.postId }
        }),

    report: protectedProcedure
        .meta({ description: "Report a comment for moderation review." })
        .input(
            z.object({
                id: z.string().min(1),
                reason: z.string().trim().min(1, "Reason is required"),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const comment = await getCommentById(input.id)

            if (!comment) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Comment not found",
                })
            }

            const aiResponse = await askAi(
                `
        You are a content moderation system for Quacky.

        Determine whether a user's comment violates Quacky's rules.

        A comment is inappropriate if it contains or promotes:
        - hate speech
        - threats or encouragement of violence
        - harassment or targeted bullying
        - explicit sexual content
        - spam, scams, or impersonation
        - encouragement of self-harm
        - private personal information (doxxing)
        - usernames or profile text designed primarily to abuse or evade moderation

        The report reason is only additional context. Do NOT assume the report is truthful.
        However, with your own judgement, if the user's comment is inappropriate, return true even if the report reason is not entirely accurate.

        With your AI report reason, please be mindful that you do not include the offensive content in your response.
        Instead, provide a short consise summary of what rule was broken, and a brief explanation without giving anything inappropriate on what was flagged.

        Return ONLY valid JSON.

        {
        "is_inappropriate": boolean,
        "reason": string
        }

        If the comment is acceptable, return:

        {
        "is_inappropriate": false,
        "reason": ""
        }
    `,
                `
        Comment: ${comment.content}
        User: ${comment.author.username}

        Reporter's reason:
        ${input.reason}
    `
            )

            const determinedResult = JSON.parse(aiResponse) as {
                is_inappropriate: boolean
                reason: string
            }

            if (determinedResult.is_inappropriate) {
                await Admin.flagComment(comment.id)
                await send(
                    comment.authorId,
                    "quacky",
                    `Hello, ${comment.author.name}. \n\nYour [content](${env.BETTER_AUTH_URL}/content/${comment.postId}), created on **${new Date().toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}** has been unlisted: **${determinedResult.reason}**\n\nThis incident has been flagged pending further review from an administrator.\n\nPlease ensure you are familiar with our [Community Guidelines](https://quacky.space/terms) to avoid further incidents.\n\nIf you believe this is a mistake, talk to a school admin.`
                )
            }

            await addXP(ctx.session.user.username, xp.report)

            await send(
                ctx.session.user.id,
                "quacky",
                `Hello, ${ctx.session.user.name}. \n\nThank you for reporting abuse content you thought was inappropriate by **${comment.author.username}**.\n\nYour report has been submitted and will be reviewed by an administrator shortly.\n\nYou have earned **${xp.report} XP** for your contribution to keeping the community safe.\n\n Thankyou!`
            )

            await Up.ingest({
                title: "New comment Report - " + comment.id,
                icon: "🚩",
                description: `A new report has been submitted for comment ${comment.id}. Reason: ${input.reason}`,
                fields: [
                    { title: "Author Username", value: comment.author.username },
                    { title: "Author ID", value: comment.authorId },
                    {
                        title: "Auto Flagged?",
                        value: determinedResult.is_inappropriate ? "Yes" : "No",
                    },
                    { title: "AI Reason", value: determinedResult.reason },
                ],
                data: {
                    offender: comment,
                    reportReason: input.reason,
                    ai: {
                        isInappropriate: determinedResult.is_inappropriate,
                        reason: determinedResult.reason,
                    },
                },
                actions: [
                    {
                        title: "View Comment",
                        variant: "primary",
                        url: `https://quacky.space/comment/${comment.id}`,
                    },
                ],
            })

            return { message: "Report submitted, thanks!" }
        }),
})
