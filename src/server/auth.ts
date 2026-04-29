import { betterAuth } from "better-auth";
import { magicLink } from "better-auth/plugins";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { Resend } from "resend";

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
        },

        plugins: [
            magicLink({
                sendMagicLink: async ({ email, url }) => {
                    await resend.emails.send({
                        from: env.EMAIL_FROM,
                        to: email,
                        subject: "Your Quacky sign-in link",
                        html: `
                            <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
                                <img src="https://quacky.space/assets/logo/sleepy.png" alt="Quacky" style="width:64px;height:64px;display:block;margin:0 auto 24px" />
                                <h2 style="text-align:center;margin:0 0 8px;font-size:22px">Sign in to Quacky</h2>
                                <p style="text-align:center;color:#6b7280;margin:0 0 32px;font-size:15px">Click the button below to sign in. This link expires in 1 hour.</p>
                                <a href="${url}" style="display:block;text-align:center;background:#1d9bf0;color:#fff;text-decoration:none;padding:14px 24px;border-radius:10px;font-weight:700;font-size:15px">Sign in to Quacky</a>
                                <p style="text-align:center;color:#9ca3af;font-size:12px;margin-top:24px">If you didn't request this, you can safely ignore this email.</p>
                            </div>
                        `,
                    });
                },
            }),
        ],
    }
);
