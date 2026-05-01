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
            // kept for the /api/auth/magic-link/verify endpoint
            magicLink({
                sendMagicLink: async () => { /* email is sent by emailOTP below */ },
            }),
            emailOTP({
                sendVerificationOTP: async ({ email, otp, type }) => {
                    if (type !== "sign-in") return;

                    // Generate a magic link token and store it so the verify endpoint can use it
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
                        html: `
                            <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#f5f0e8">
                                <img src="https://quacky.space/assets/logo/sleepy.png" alt="Quacky" style="width:64px;height:64px;display:block;margin:0 auto 24px" />
                                <h2 style="text-align:center;margin:0 0 8px;font-size:22px;color:#2d1200">Sign in to Quacky</h2>
                                <p style="text-align:center;color:#6b5a4e;margin:0 0 28px;font-size:15px">Use the code below or click the button to sign in. Both expire in 5 minutes.</p>

                                <div style="background:#fff;border:1px solid #d9c8b8;border-radius:12px;padding:20px 24px;text-align:center;margin-bottom:24px">
                                    <p style="margin:0 0 4px;font-size:12px;color:#9c8070;letter-spacing:0.05em;text-transform:uppercase">Your sign-in code</p>
                                    <p style="margin:0;font-size:36px;font-weight:800;letter-spacing:0.15em;color:#2d1200">${otp}</p>
                                </div>

                                <p style="text-align:center;color:#9c8070;font-size:13px;margin:0 0 16px">or click the button to sign in instantly</p>

                                <a href="${magicLinkUrl}" style="display:block;text-align:center;background:#4a1500;color:#f5f0e8;text-decoration:none;padding:14px 24px;border-radius:10px;font-weight:700;font-size:15px">Sign in to Quacky</a>

                                <p style="text-align:center;color:#b0a090;font-size:12px;margin-top:24px">If you didn't request this, you can safely ignore this email.</p>
                            </div>
                        `,
                    });
                },
            }),
        ],
    }
);
