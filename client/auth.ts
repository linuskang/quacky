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

import { createAuthClient } from "better-auth/react"
import { inferAdditionalFields } from "better-auth/client/plugins"
import { adminClient } from "better-auth/client/plugins"

export const authClient = createAuthClient(
    {
        plugins: [
            inferAdditionalFields({
                user: {
                    username: {
                        type: "string",
                        required: true
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
                    verified: {
                        type: "boolean",
                        required: false,
                        default: false
                    },
                    role: {
                        type: "string",
                        required: false,
                        default: "user"
                    },
                    image: {
                        type: "string",
                        required: false,
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
                    }
                },
            }),
            adminClient()
        ]
    }
)
