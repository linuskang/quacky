import { createAuthClient } from "better-auth/react";
import { sentinelClient } from "@better-auth/infra/client";
import { adminClient, inferAdditionalFields, magicLinkClient } from "better-auth/client/plugins"


export const authClient = createAuthClient({
    plugins: [
        sentinelClient(),
        adminClient(),
        magicLinkClient(),
        inferAdditionalFields({
            user: {
                handle: {
                    type: "string",
                    required: true,
                },
            },
        }),
    ]
});
