//    ____                   _          
//   / __ \                 | |         
//  | |  | |_   _  __ _  ___| | ___   _ 
//  | |  | | | | |/ _` |/ __| |/ / | | |
//  | |__| | |_| | (_| | (__|   <| |_| |
//   \___\_\\__,_|\__,_|\___|_|\_\\__, |
//                                 __/ |
//                                |___/ 

import { betterAuth, APIError } from "better-auth";
import { magicLink } from "better-auth/plugins";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@/server/db";
import { env } from "@/env"
import Send from "@/server/utilities/email";

export const auth = betterAuth(
    {
        // db
        database: prismaAdapter(prisma, {
            provider: "postgresql"
        }),

        // user variables for types. this is mirrored with @/types
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

        appName: "Quacky",
        baseURL: env.BETTER_AUTH_URL,
        secret: env.BETTER_AUTH_SECRET,

        // if your editing this, you can add extra auth providers here.
        // check the better-auth.com documentation for examples.
        socialProviders: {
            github: {
                clientId: env.GITHUB_CLIENT_ID,
                clientSecret: env.GITHUB_CLIENT_SECRET,
                disableSignUp: true // ensure to add this, otherwise it will bypass account creation middleware 
            },
        },

        advanced: {
            // cf proxy support
            ipAddress: {
                ipAddressHeaders: ["cf-connecting-ip", "x-forwarded-for"],
            }
        },

        rateLimit: {
            enabled: true,
        },

        plugins: [

            // Magic links for login.
            magicLink(
                {
                    expiresIn: 60 * 60, // 1hr
                    
                    sendMagicLink: async ({ email, url }) => {
                        
                        const existingUser = await prisma.user.findUnique({
                            where: { email },
                            select: { id: true },
                        });

                        if (!existingUser) {
                            throw new APIError("FORBIDDEN", {
                                message: "Hmm... We couldn't find an account with that email. Please create an account at /onboarding to continue.",
                            });
                        }

                        await Send(
                            email,
                            "Your Quacky login link",
                            `Hello!\n\nClick the link below to sign in to Quacky:\n\n${url}\n\nThis link expires in 1 hour. If you did not request this, please contact us immediately at quacky@quacky.space`
                        );
                    },
                }
            ),

        ],
    }
);
