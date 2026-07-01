import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/server/prisma";
import { env } from "@/env";
import { z } from "zod";
import { APIError } from "@better-auth/core/error";
import { Resend } from "resend";
import { admin } from "better-auth/plugins"
import { NotificationService } from "@/server/helpers";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const resend = new Resend(env.RESEND_API_KEY);

export async function getSession() {
    return auth.api.getSession({
        headers: await headers(),
    });
}

export async function requireSession() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        redirect("/auth/login");
    }
    return session;
}

export const auth = betterAuth(
    {
        database: prismaAdapter(prisma, {
            provider: "postgresql"
        }),

        plugins: [
            admin()
        ],

        emailAndPassword: {
            enabled: true,
            requireEmailVerification: true,
            sendResetPassword: async (data) => {
                await resend.emails.send({
                    from: env.EMAIL_FROM,
                    to: data.user.email,
                    subject: "Reset your password",
                    html: `
                        <p>Hi ${data.user.name},</p>
                        <p>Please click this link to reset your password:</p>
                        <a href="${data.url}">Reset Password</a>
                        <p>This link expires soon. If you didn't request this, you can safely ignore this email.</p>
                        <p><strong>Please do not reply to this email.</strong></p>
                    `
                });
            }
        },

        emailVerification: {
            sendOnSignIn: true,
            sendOnSignUp: true,
            sendVerificationEmail: async (data) => {
                await resend.emails.send({
                    from: env.EMAIL_FROM,
                    to: data.user.email,
                    subject: "Verify your email",
                    html: `
                        <p>Hi ${data.user.name},</p>
                        <p>Please click this link to verify your email:</p>
                        <a href="${data.url}">Verify Email</a>
                        <p>If you didn't request this, please contact us at <a href="mailto:admin@quacky.space">admin@quacky.space</a> to have it resolved.</p>
                        <p><strong>Please do not reply to this email.</strong></p>
                    `
                });
            }
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
                },
                statsForNerds: {
                    type: "boolean",
                    required: false,
                    default: false
                },
                private: {
                    type: "boolean",
                    required: false,
                    default: false
                },
                streamerMode: {
                    type: "boolean",
                    required: false,
                    default: false
                },
                hideTips: {
                    type: "boolean",
                    required: false,
                    default: false
                },
                bio: {
                    type: "string",
                    required: false
                },
                bannerImage: {
                    type: "string",
                    required: false
                },
                pronoun: {
                    type: "string",
                    required: false
                },
                location: {
                    type: "string",
                    required: false
                },
                website: {
                    type: "string",
                    required: false
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

                        if (!user.image) {
                            return {
                                data: {
                                    ...user,
                                    image: `https://avatars.linus.my/10.x/micah/svg?seed=${encodeURIComponent(user.name)}`
                                }
                            };
                        }
                    },
                    after: async (user) => {
                        NotificationService.send(
                            user.id,
                            'quacky',
                            `Welcome to Quacky, ${user.name}!\n\nWe're so glad you're here. You can now start posting and interacting with your school community.\n\nBefore you start, we recommend you check out our [Community Standards](https://quacky.space/terms) to ensure a safe and enjoyable experience for everyone.\n\nAfter, feel free to customise your [profile](${env.BETTER_AUTH_URL}/@${user.username}) to be yourself.\n\nIf you have any questions or need assistance, feel free to reach out at admin@quacky.space.\n\nHappy Quacking!\n**The Quacky Team**`
                        );
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
