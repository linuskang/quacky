import { TRPCError } from "@trpc/server"

import { protectedProcedure, router } from "@/server/api/trpc"
import { prisma } from "@/server/prisma"

function isPrismaUniqueError(error: unknown): error is { code: string } {
    return (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code: string }).code === "P2002"
    )
}

function todayDate() {
    const now = new Date()
    return new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
    )
}

async function getRank(number: number, date: Date) {
    const higher = await prisma.rngEntry.count({
        where: {
            date,
            number: { gt: number },
        },
    })
    return higher + 1
}

export const rngRouter = router({
    mine: protectedProcedure
        .meta({
            description:
                "Get the signed-in user's RNG roll and rank for today, or null if they haven't rolled yet.",
        })
        .query(async ({ ctx }) => {
            const date = todayDate()

            const todayEntry = await prisma.rngEntry.findUnique({
                where: {
                    userId_date: {
                        userId: ctx.session.user.id,
                        date,
                    },
                },
            })

            if (!todayEntry) {
                return null
            }

            const rank = await getRank(todayEntry.number, date)

            return {
                number: todayEntry.number,
                rank,
            }
        }),

    today: protectedProcedure
        .meta({ description: "Get today's top 10 RNG leaderboard entries and total player count." })
        .query(async () => {
            const date = todayDate()

            const [entries, total] = await Promise.all([
                prisma.rngEntry.findMany({
                    where: { date },
                    orderBy: { number: "desc" },
                    take: 10,
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                username: true,
                                image: true,
                            },
                        },
                    },
                }),
                prisma.rngEntry.count({ where: { date } }),
            ])

            return {
                total,
                entries,
            }
        }),

    roll: protectedProcedure
        .meta({ description: "Roll today's random number (once per UTC day)." })
        .mutation(async ({ ctx }) => {
            const date = todayDate()

            const currentEntry = await prisma.rngEntry.findUnique({
                where: {
                    userId_date: {
                        userId: ctx.session.user.id,
                        date,
                    },
                },
            })

            if (currentEntry) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "You have already submitted a request for today.",
                })
            }

            const randomNumber = Math.floor(Math.random() * 1_000_000) + 1

            try {
                const newEntry = await prisma.rngEntry.create({
                    data: {
                        userId: ctx.session.user.id,
                        number: randomNumber,
                        date,
                    },
                })

                const rank = await getRank(newEntry.number, date)

                return {
                    number: newEntry.number,
                    rank,
                }
            } catch (error) {
                if (isPrismaUniqueError(error)) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message:
                            "You have already submitted a request for today.",
                    })
                }

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Something went wrong.",
                })
            }
        }),
})
