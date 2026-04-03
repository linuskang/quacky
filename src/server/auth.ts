import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { Resend } from "resend";

import prisma from "@/server/db";
import { env } from "@/env"

const resend = new Resend(env.RESEND_API_KEY);

export const auth = betterAuth({
    database: prismaAdapter(prisma,
        {
            provider: "postgresql"
        }
    ),

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
    trustedOrigins: env.BETTER_AUTH_TRUSTED_ORIGINS,

    socialProviders: {
        github: {
            clientId: env.GITHUB_CLIENT_ID,
            clientSecret: env.GITHUB_CLIENT_SECRET
        }
    },

    advanced: {
        ipAddress: {
            ipAddressHeaders: ["cf-connecting-ip", "x-forwarded-for"],
        }
    },

    rateLimit: {
        enabled: true,
    }
});
