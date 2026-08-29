//   ______                                 __
//  /      \                               /  |
// /$$$$$$  | __    __   ______    _______ $$ |   __  __    __
// $$ |  $$ |/  |  /  | /      \  /       |$$ |  /  |/  |  /  |
// $$ |  $$ |$$ |  $$ | $$$$$$  |/$$$$$$$/ $$ |_/$$/ $$ |  $$ |
// $$ |_ $$ |$$ |  $$ | /    $$ |$$ |      $$   $$<  $$ |  $$ |
// $$ / \$$ |$$ \__$$ |/$$$$$$$ |$$ \_____ $$$$$$  \ $$ \__$$ |
// $$ $$ $$< $$    $$/ $$    $$ |$$       |$$ | $$  |$$    $$ |
//  $$$$$$  | $$$$$$/   $$$$$$$/  $$$$$$$/ $$/   $$/  $$$$$$$ |
//      $$$/                                         /  \__$$ |
//                                                   $$    $$/
//                                                    $$$$$$/
//
// Linus Kang, 2026
// Work is licensed under the CC BY-NC 4.0 license.

import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { prisma } from "@/server/prisma"
import { env } from "@/env"
import { z } from "zod"
import { APIError } from "@better-auth/core/error"
import { Resend } from "resend"
import { admin } from "better-auth/plugins"
import { NotificationService } from "@/server/helpers"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
// import { haveIBeenPwned } from "better-auth/plugins"
import { openAPI } from "better-auth/plugins"
import { Up } from "@/server/upstream"
import { canSignup, allowProfileChange } from "@/lib/var"
import { apiKey } from "@better-auth/api-key"

const resend = new Resend(env.RESEND_API_KEY)

export async function getSession() {
    return auth.api.getSession({
        headers: await headers(),
    })
}

export async function requireSession() {
    const session = await auth.api.getSession({
        headers: await headers(),
    })

    if (!session) {
        redirect("/auth/login")
    }
    return session
}

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),

    plugins: [
        admin({
            bannedUserMessage:
                "Your account is banned. Please see an administrator for assistance.",
        }),
        // haveIBeenPwned({
        //     customPasswordCompromisedMessage:
        //         "This password has been compromised in a data breach. Please choose a different password.",
        // }),
        openAPI(),
        apiKey(),
    ],

    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
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
                    `,
            })
        },
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
                    `,
            })
        },
    },

    user: {
        additionalFields: {
            username: {
                type: "string",
                // OAuth providers do not submit this application-specific field;
                // the create hook replaces this sentinel with a generated username.
                required: true,
                defaultValue: "",
                unique: true,
                validator: {
                    input: z
                        .string()
                        .min(5, "Username must be at least 5 characters long")
                        .max(
                            20,
                            "Username must be less than 20 characters long"
                        )
                        .regex(
                            /^[a-zA-Z0-9_]+$/,
                            "Username can only contain letters, numbers, and underscores"
                        ),
                },
            },
            statsForNerds: {
                type: "boolean",
                required: false,
                default: false,
            },
            private: {
                type: "boolean",
                required: false,
                default: false,
            },
            streamerMode: {
                type: "boolean",
                required: false,
                default: false,
            },
            hideTips: {
                type: "boolean",
                required: false,
                default: false,
            },
            bio: {
                type: "string",
                required: false,
            },
            bannerImage: {
                type: "string",
                required: false,
            },
            pronoun: {
                type: "string",
                required: false,
            },
            location: {
                type: "string",
                required: false,
            },
            website: {
                type: "string",
                required: false,
            },
            unlockedPosting: {
                type: "boolean",
                required: false,
                default: false,
            },
            unlockedCommenting: {
                type: "boolean",
                required: false,
                default: false,
            },
            unlockedDms: {
                type: "boolean",
                required: false,
                default: false,
            },
            unlockedFuzzies: {
                type: "boolean",
                required: false,
                default: false,
            },
            unlockedProfiles: {
                type: "boolean",
                required: false,
                default: false,
            },
            pushNotificationsEnabled: {
                type: "boolean",
                required: false,
                default: true,
            },
        },
    },

    databaseHooks: {
        user: {
            create: {
                before: async (user) => {
                    if (!canSignup) {
                        throw APIError.from("FORBIDDEN", {
                            code: "SIGNUP_DISABLED",
                            message:
                                "Signups are currently disabled. Contact an admin.",
                        })
                    }
                    let username = (user as Record<string, unknown>).username as string | undefined

                    if (!username) {
                        username = (user as Record<string, unknown>).email as string | undefined

                        if (username) {
                            username = username
                                .split("@")[0]
                                .toLowerCase()
                                .replace(/[^a-z0-9_]/g, "")
                                .slice(0, 20)

                            if (username.length < 5) {
                                username = `${username}user`.slice(0, 20)
                            }
                        }
                    }

                    if (username) {
                        const existing = await prisma.user.findUnique({
                            where: { username },
                        })

                        if (existing) {
                            throw APIError.from("UNPROCESSABLE_ENTITY", {
                                code: "USERNAME_ALREADY_EXISTS",
                                message: "Username is already taken",
                            })
                        }

                        return {
                            data: {
                                ...user,
                                username,
                                ...(!user.image && {
                                    image: `https://avatars.lkang.au/10.x/micah/svg?seed=${encodeURIComponent(user.name)}`,
                                }),
                            },
                        }
                    }

                    if (!user.image) {
                        return {
                            data: {
                                ...user,
                                image: `https://avatars.lkang.au/10.x/micah/svg?seed=${encodeURIComponent(user.name)}`,
                            },
                        }
                    }
                },
                after: async (user) => {
                    NotificationService.send(
                        user.id,
                        "quacky",
                        `Welcome to Quacky, ${user.name}!\n\nWe're so glad you're here. You can now start posting and interacting with your school community.\n\nBefore you start, we recommend you check out our [Community Standards](${env.BETTER_AUTH_URL}/terms) to ensure a safe and enjoyable experience for everyone.\n\nAfter, feel free to customise your [profile](${env.BETTER_AUTH_URL}/@${user.username}) to be yourself.\n\nIf you have any questions or need assistance, feel free to reach out at admin@quacky.space.\n\nHappy Quacking!\n**The Quacky Team**`
                    )
                    Up.ingest({
                        title: "New user signed up",
                        description: `User ${user.name} (@${user.username}) has signed up.`,
                        category: "user.signup",
                        icon: "🎉",
                        data: user,
                    }).catch(() => { })
                },
            },
            update: {
                before: async (user) => {
                    if (!allowProfileChange) {
                        throw APIError.from("FORBIDDEN", {
                            code: "PROFILE_CHANGE_DISABLED",
                            message:
                                "Profile changes are currently disabled. Contact an admin.",
                        })
                    } else {
                        const username = (user as Record<string, unknown>)
                            .username as string | undefined
                        if (username) {
                            const existing = await prisma.user.findUnique({
                                where: { username },
                            })
                            if (existing) {
                                throw APIError.from("UNPROCESSABLE_ENTITY", {
                                    code: "USERNAME_ALREADY_EXISTS",
                                    message: "Username is already taken",
                                })
                            }
                        }
                    }
                },
            },
        },
    },

    socialProviders: {
        github: {
            clientId: env.GITHUB_CLIENT_ID,
            clientSecret: env.GITHUB_CLIENT_SECRET,
            disableSignup: false,
        },
        google: {
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
            disableSignup: false,
        },
        microsoft: {
            clientId: env.MICROSOFT_CLIENT_ID,
            clientSecret: env.MICROSOFT_CLIENT_SECRET,
            disableSignup: false,
        }
    },
})
