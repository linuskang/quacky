import { createAuthClient } from "better-auth/react";
import { sentinelClient } from "@better-auth/infra/client";
import { adminClient, emailOTPClient, inferAdditionalFields, magicLinkClient } from "better-auth/client/plugins"
import type { auth } from "@/server/auth";


export const authClient = createAuthClient({
    plugins: [
        sentinelClient(),
        adminClient(),
        magicLinkClient(),
        emailOTPClient(),
        inferAdditionalFields<typeof auth>(),
    ]
});
