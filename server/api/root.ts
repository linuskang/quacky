import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { prisma } from "@/server/prisma";
import { protectedProcedure, router } from "@/server/api/trpc";

export const appRouter = router({
    me: protectedProcedure.query(async ({ ctx }) => {
        const user = await prisma.user.findUnique({
            where: { id: ctx.session.user.id },
            select: {
                id: true,
                name: true,
                username: true,
                image: true,
                bio: true,
            },
        });

        if (!user) {
            throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
        }

        return user;
    }),

    userList: protectedProcedure.query(async () => {
        return prisma.user.findMany({
            orderBy: { username: "asc" },
            take: 10,
            select: {
                id: true,
                name: true,
                username: true,
                image: true,
            },
        });
    }),

    searchUsers: protectedProcedure
        .input(
            z.object({
                query: z.string().trim().min(1).max(30),
            })
        )
        .query(({ input }) =>
            prisma.user.findMany({
                where: {
                    OR: [
                        { username: { contains: input.query, mode: "insensitive" } },
                        { name: { contains: input.query, mode: "insensitive" } },
                    ],
                    banned: false,
                },
                orderBy: { username: "asc" },
                take: 10,
                select: {
                    id: true,
                    name: true,
                    username: true,
                    image: true,
                },
            })
        ),

    updateBio: protectedProcedure
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
            });
        }),
});

export type AppRouter = typeof appRouter;
