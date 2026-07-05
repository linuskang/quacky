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
            DESCRIPTION: z.string(),
            AI_URL: z.string(),
            AI_KEY: z.string(),
            AI_MODEL: z.string(),
            RUSTFS_ENDPOINT: z.url(),
            RUSTFS_REGION: z.string().default("auto"),
            RUSTFS_ACCESS_KEY_ID: z.string(),
            RUSTFS_SECRET_ACCESS_KEY: z.string(),
            RUSTFS_BUCKET: z.string().default("qky"),
            RUSTFS_PUBLIC_BASE_URL: z.url().default("https://cdn.linus.my/qky"),
        },

        experimental__runtimeEnv: {},
        emptyStringAsUndefined: true,
        skipValidation: !!process.env.CI || process.env.SKIP_ENV_VALIDATION === "true",
    }
);
