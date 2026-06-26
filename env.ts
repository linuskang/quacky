import { createEnv } from "@t3-oss/env-nextjs";
import * as z from "zod";
import "dotenv/config";

export const env = createEnv(
    {
        server: {
            DATABASE_URL: z.string(),
            ORG_NAME: z.string(),
            VERSION: z.string(),
            GITHUB_CLIENT_ID: z.string(),
            GITHUB_CLIENT_SECRET: z.string(),
            UPSTREAM_API_KEY: z.string(),
            RESEND_API_KEY: z.string(),
            EMAIL_FROM: z.string(),
            BETTER_AUTH_URL: z.string(),
        },

        experimental__runtimeEnv: {},
        emptyStringAsUndefined: true,
        skipValidation: !!process.env.CI || process.env.SKIP_ENV_VALIDATION === "true",
    }
);
