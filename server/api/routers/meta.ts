import { TRPCError } from "@trpc/server"
import axios from "axios"
import { XMLParser } from "fast-xml-parser"
import { z } from "zod"

import { env } from "@/env"
import { canSignup, rules, version } from "@/lib/var"
import { protectedProcedure, publicProcedure, router } from "@/server/api/trpc"
import { prisma } from "@/server/prisma"
import { Up } from "@/server/upstream"

export const metaRouter = router({
    get: publicProcedure
        .meta({ description: "Get public Quacky instance metadata, stats, rules, and QOTD." })
        .query(async () => {
            const [posts, users] = await Promise.all([
                prisma.post.count(),
                prisma.user.count(),
            ])

            return {
                org: {
                    name: env.ORG_NAME,
                    description: env.DESCRIPTION,
                    rules,
                    loginBannerMsg: env.LOGIN_BANNER_MESSAGE,
                },
                version,
                stats: {
                    posts,
                    users,
                },
                qotd: env.QOTD,
                canSignup,
            }
        }),

    trending: publicProcedure
        .meta({ description: "Get top trending hashtags across unflagged posts." })
        .query(async () => {
            const hashtags = await prisma.postHashtag.groupBy({
                by: ["tag"],
                where: {
                    post: {
                        flagged: false,
                        author: {
                            banned: false,
                        },
                    },
                },
                _count: {
                    tag: true,
                },
                orderBy: {
                    _count: {
                        tag: "desc",
                    },
                },
                take: 3,
            })

            return hashtags.map((hashtag) => ({
                tag: hashtag.tag,
                count: hashtag._count.tag,
            }))
        }),

    news: protectedProcedure
        .meta({ description: "Fetch and parse the ABC News RSS feed." })
        .query(async () => {
            try {
                const res = await axios.get(
                    "https://www.abc.net.au/news/feed/51120/rss.xml"
                )

                const parser = new XMLParser({
                    ignoreAttributes: false,
                    attributeNamePrefix: "@_",
                })

                const parsedData = parser.parse(res.data)
                return { parsedData }
            } catch {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to fetch news feed",
                })
            }
        }),

    leaderboard: protectedProcedure
        .meta({ description: "Get top public users ranked by points." })
        .query(async () => {
            const users = await prisma.user.findMany({
                where: {
                    private: false,
                    banned: false,
                },
                select: {
                    username: true,
                    name: true,
                    image: true,
                    points: true,
                },
                orderBy: [{ points: "desc" }, { username: "asc" }],
                take: 3,
            })

            return { users }
        }),

    feedback: protectedProcedure
        .meta({ description: "Submit product feedback to the feedback portal." })
        .input(
            z.object({
                usability: z.number().int().min(1).max(5),
                satisfaction: z.number().int().min(1).max(5),
                recommend: z.number().int().min(1).max(5),
                visual: z.number().int().min(1).max(5),
                comments: z.string().trim().min(1),
            })
        )
        .mutation(async ({ ctx, input }) => {
            await Up.ingest({
                title: `Feedback submitted from ${ctx.session.user.name} (${ctx.session.user.email})`,
                icon: "📋",
                category: "feedback",
                fields: [
                    { title: "Usability", value: String(input.usability) },
                    { title: "Satisfaction", value: String(input.satisfaction) },
                    { title: "Recommend", value: String(input.recommend) },
                    { title: "Visual", value: String(input.visual) },
                ],
                description: input.comments,
                data: [
                    input,
                    {
                        user: {
                            name: ctx.session.user.name,
                            email: ctx.session.user.email,
                            id: ctx.session.user.id,
                        },
                    },
                ],
            })

            return { message: "Feedback submitted, thanks!" }
        }),
})
