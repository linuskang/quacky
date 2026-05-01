import { betterAuth, APIError } from "better-auth";
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
                        // Check for a valid pending invite for this email
                        const invite = await prisma.invite.findFirst({
                            where: {
                                email: user.email,
                                used: false,
                                OR: [
                                    { expiresAt: null },
                                    { expiresAt: { gt: new Date() } },
                                ],
                            },
                            orderBy: { createdAt: "desc" },
                        });

                        if (invite) {
                            return {
                                data: {
                                    ...user,
                                    name: invite.displayName,
                                    handle: invite.handle,
                                    role: "Member",
                                },
                            };
                        }

                        // No invite — check if self-registration is enabled
                        const selfRegisterConfig = await prisma.config.findUnique({
                            where: { key: "self_register" },
                        });

                        const selfRegisterEnabled =
                            selfRegisterConfig == null ||
                            (selfRegisterConfig.value as { enabled?: boolean })?.enabled !== false;

                        if (!selfRegisterEnabled) {
                            // Block creation — no invite and registration is closed
                            return false;
                        }

                        const randomId = Math.floor(1000000 + Math.random() * 9000000);
                        const defaultHandle = `user-${randomId}`;

                        return {
                            data: {
                                ...user,
                                name: user.name || defaultHandle,
                                handle: defaultHandle,
                                role: "Member",
                            },
                        };
                    },
                    after: async (user) => {
                        // Mark any matching invite as used now that the account exists
                        await prisma.invite.updateMany({
                            where: {
                                email: user.email,
                                used: false,
                            },
                            data: {
                                used: true,
                                usedAt: new Date(),
                            },
                        });
                    },
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

                    // Only block new accounts — existing users can always sign in
                    const existingUser = await prisma.user.findUnique({
                        where: { email },
                        select: { id: true },
                    });

                    if (!existingUser) {
                        const invite = await prisma.invite.findFirst({
                            where: {
                                email,
                                used: false,
                                OR: [
                                    { expiresAt: null },
                                    { expiresAt: { gt: new Date() } },
                                ],
                            },
                            select: { id: true },
                        });

                        if (!invite) {
                            const selfRegisterConfig = await prisma.config.findUnique({
                                where: { key: "self_register" },
                            });

                            const selfRegisterEnabled =
                                selfRegisterConfig == null ||
                                (selfRegisterConfig.value as { enabled?: boolean })?.enabled !== false;

                            if (!selfRegisterEnabled) {
                                throw new APIError("FORBIDDEN", {
                                    message: "Registration is currently closed. You need an invitation to join.",
                                });
                            }
                        }
                    }

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
