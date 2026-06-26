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
                    }
                },
            }),
            adminClient()
        ]
    }
)