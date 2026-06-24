import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/server/prisma";
import { env } from "@/env";
import { z } from "zod";
import { APIError } from "@better-auth/core/error";

export const auth = betterAuth(
    {
        database: prismaAdapter(prisma, {
            provider: "postgresql"
        }),

        emailAndPassword: {
            enabled: true
        },

        user: {
            additionalFields: {
                username: {
                    type: "string",
                    required: true,
                    unique: true,
                    validator: {
                        input: z.string()
                            .min(5, "Username must be at least 5 characters long")
                            .max(20, "Username must be less than 20 characters long")
                            .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
                    }
                }
            }
        },

        databaseHooks: {
            user: {
                create: {
                    before: async (user) => {
                        const username = (user as Record<string, unknown>).username as string | undefined;
                        if (username) {
                            const existing = await prisma.user.findUnique({
                                where: { username }
                            });
                            if (existing) {
                                throw APIError.from("UNPROCESSABLE_ENTITY", {
                                    code: "USERNAME_ALREADY_EXISTS",
                                    message: "Username is already taken"
                                });
                            }
                        }
                    }
                },
                update: {
                    before: async (user) => {
                        const username = (user as Record<string, unknown>).username as string | undefined;
                        if (username) {
                            const existing = await prisma.user.findUnique({
                                where: { username }
                            });
                            if (existing) {
                                throw APIError.from("UNPROCESSABLE_ENTITY", {
                                    code: "USERNAME_ALREADY_EXISTS",
                                    message: "Username is already taken"
                                });
                            }
                        }
                    }
                }
            }
        },

        socialProviders: {
            github: {
                clientId: env.GITHUB_CLIENT_ID,
                clientSecret: env.GITHUB_CLIENT_SECRET,
                disableSignup: true,
            }
        }

    }
)