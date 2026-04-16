import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

import prisma from "@/server/db";
import { env } from "@/env"

export const auth = betterAuth(
    {
        database: prismaAdapter(prisma, {
            provider: "postgresql"
        }),

        user: {
            additionalFields: {
                handle: {
                    type: "string",
                    required: true,
                },
                role: {
                    type: "string",
                    required: true,
                    default: "Member",
                },
                bio: {
                    type: "string",
                    required: false,
                },
                website: {
                    type: "string",
                    required: false,
                },
                location: {
                    type: "string",
                    required: false,
                },
                pronouns: {
                    type: "string",
                    required: false,
                },
                banner: {
                    type: "string",
                    required: false,
                },
                accentColor: {
                    type: "string",
                    required: false,
                    default: "#1d9bf0",
                },
                github: {
                    type: "string",
                    required: false,
                },
                twitter: {
                    type: "string",
                    required: false,
                },
                discord: {
                    type: "string",
                    required: false,
                },
                privateAccount: {
                    type: "boolean",
                    required: true,
                    default: false,
                },
                emailNotif: {
                    type: "boolean",
                    required: true,
                    default: true,
                }
            },
        },

        databaseHooks: {
            user: {
                create: {
                    before: async (user) => {
                        const randomId = Math.floor(1000000 + Math.random() * 9000000);
                        const defaultHandle = `user-${randomId}`;

                        return {
                            data: {
                                ...user,
                                name: user.name || defaultHandle,
                                handle: defaultHandle,
                            },
                        };
                    }
                },
            },
        },

        appName: "Quacky",

        baseURL: env.BETTER_AUTH_URL,
        secret: env.BETTER_AUTH_SECRET,

        socialProviders: {
            github: {
                clientId: env.GITHUB_CLIENT_ID,
                clientSecret: env.GITHUB_CLIENT_SECRET
            },
        },

        advanced: {
            ipAddress: {
                ipAddressHeaders: ["cf-connecting-ip", "x-forwarded-for"],
            }
        },

        rateLimit: {
            enabled: true,
        }
    }
);
