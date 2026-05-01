import { betterAuth } from "better-auth";
import { magicLink, emailOTP } from "better-auth/plugins";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { Resend } from "resend";
import { randomBytes } from "crypto";

import prisma from "@/server/db";
import { env } from "@/env"

const resend = new Resend(env.RESEND_API_KEY);

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
        },

        plugins: [
            magicLink({
                sendMagicLink: async () => { /* email is sent by emailOTP */ },
            }),
            emailOTP({
                sendVerificationOTP: async ({ email, otp, type }) => {
                    if (type !== "sign-in") return;

                    const token = randomBytes(24).toString("base64url");
                    await prisma.verification.create({
                        data: {
                            id: randomBytes(16).toString("hex"),
                            identifier: token,
                            value: JSON.stringify({ email, name: "", attempt: 0 }),
                            expiresAt: new Date(Date.now() + 60 * 60 * 1000),
                        },
                    });
                    const magicLinkUrl = `${env.BETTER_AUTH_URL}/api/auth/magic-link/verify?token=${token}&callbackURL=/`;

                    await resend.emails.send({
                        from: env.EMAIL_FROM,
                        to: email,
                        subject: "Your Quacky sign-in code",
                        text: `Your OTP code is ${otp}. Or click the link to sign in: ${magicLinkUrl}. If you did not request this, please contact us immediately at quacky@quacky.space`,
                    });
                },
            }),
        ],
    }
);
