import { TRPCError } from "@trpc/server"
import { z } from "zod"

import { env } from "@/env"
import { protectedProcedure, router } from "@/server/api/trpc"
import { prisma } from "@/server/prisma"
import { Up } from "@/server/upstream"

export const memesRouter = router({
    list: protectedProcedure
        .meta({
            description:
                "List unflagged memes with vote counts, score, and the current user's vote in a single query.",
        })
        .query(async ({ ctx }) => {
            const memes = await prisma.memeland.findMany({
                where: { flagged: false },
                orderBy: { createdAt: "desc" },
                include: {
                    author: {
                        select: {
                            id: true,
                            username: true,
                            image: true,
                            name: true,
                            verified: true,
                        },
                    },
                    votes: {
                        select: {
                            userId: true,
                            type: true,
                        },
                    },
                },
            })

            return memes.map(({ votes, ...meme }) => {
                let upvotes = 0
                let downvotes = 0
                let me: "UPVOTE" | "DOWNVOTE" | null = null

                for (const vote of votes) {
                    if (vote.type === "UPVOTE") upvotes++
                    else if (vote.type === "DOWNVOTE") downvotes++
                    if (vote.userId === ctx.session.user.id) {
                        me = vote.type
                    }
                }

                return {
                    ...meme,
                    createdAt: meme.createdAt.toISOString(),
                    upvotes,
                    downvotes,
                    score: upvotes - downvotes,
                    me,
                }
            })
        }),

    byId: protectedProcedure
        .meta({ description: "Get a single meme by ID with vote counts and the current user's vote." })
        .input(z.object({ id: z.string().min(1) }))
        .query(async ({ ctx, input }) => {
            const meme = await prisma.memeland.findFirst({
                where: { id: input.id, flagged: false },
                include: {
                    author: {
                        select: {
                            id: true,
                            username: true,
                            image: true,
                            name: true,
                            verified: true,
                        },
                    },
                    votes: {
                        where: { userId: ctx.session.user.id },
                        select: { type: true },
                        take: 1,
                    },
                },
            })

            if (!meme) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Meme not found",
                })
            }

            const [upvotes, downvotes] = await prisma.$transaction([
                prisma.memeVote.count({
                    where: { memeId: input.id, type: "UPVOTE" },
                }),
                prisma.memeVote.count({
                    where: { memeId: input.id, type: "DOWNVOTE" },
                }),
            ])

            const { votes, ...memeData } = meme

            return {
                ...memeData,
                createdAt: memeData.createdAt.toISOString(),
                upvotes,
                downvotes,
                score: upvotes - downvotes,
                me: votes[0]?.type ?? null,
            }
        }),

    create: protectedProcedure
        .meta({ description: "Publish a new meme by uploaded image URL." })
        .input(z.object({ image: z.string().trim().min(1) }))
        .mutation(async ({ ctx, input }) => {
            const meme = await prisma.memeland.create({
                data: {
                    imgUrl: input.image,
                    authorId: ctx.session.user.id,
                },
                include: {
                    author: {
                        select: {
                            id: true,
                            username: true,
                            image: true,
                            name: true,
                            verified: true,
                        },
                    },
                },
            })

            return { meme }
        }),

    vote: protectedProcedure
        .meta({ description: "Upvote or downvote a meme." })
        .input(
            z.object({
                id: z.string().min(1),
                type: z.enum(["UPVOTE", "DOWNVOTE"]),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const meme = await prisma.memeland.findFirst({
                where: { id: input.id, flagged: false },
                select: { id: true },
            })

            if (!meme) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Meme not found",
                })
            }

            const vote = await prisma.memeVote.upsert({
                where: {
                    memeId_userId: {
                        memeId: input.id,
                        userId: ctx.session.user.id,
                    },
                },
                create: {
                    memeId: input.id,
                    userId: ctx.session.user.id,
                    type: input.type,
                },
                update: {
                    type: input.type,
                },
            })

            const [upvotes, downvotes] = await prisma.$transaction([
                prisma.memeVote.count({
                    where: { memeId: input.id, type: "UPVOTE" },
                }),
                prisma.memeVote.count({
                    where: { memeId: input.id, type: "DOWNVOTE" },
                }),
            ])

            return {
                vote: vote.type,
                upvotes,
                downvotes,
                score: upvotes - downvotes,
            }
        }),

    report: protectedProcedure
        .meta({ description: "Report an inappropriate meme." })
        .input(
            z.object({
                id: z.string().min(1),
                reason: z.string().trim().min(1, "Reason is required"),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const meme = await prisma.memeland.findFirst({
                where: { id: input.id, flagged: false },
                include: { author: true },
            })

            if (!meme) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Meme not found",
                })
            }

            await Up.ingest({
                title: "Meme reported by " + ctx.session.user.username,
                icon: "🙆",
                description: "Reported for: " + input.reason,
                fields: [
                    { title: "Meme ID", value: input.id },
                    {
                        title: "Meme Img",
                        value: `${env.BETTER_AUTH_URL}/memes/${input.id}`,
                    },
                    { title: "Reported by", value: ctx.session.user.username },
                    { title: "Offender ID", value: meme.id },
                ],
                actions: [
                    {
                        title: "View Meme",
                        variant: "primary",
                        url: `${env.BETTER_AUTH_URL}/memes/${input.id}`,
                    },
                    {
                        title: "View Offender",
                        variant: "secondary",
                        url: `${env.BETTER_AUTH_URL}/@${meme.author.username}`,
                    },
                ],
            })

            return { message: "reported, thanks!" }
        }),
})
