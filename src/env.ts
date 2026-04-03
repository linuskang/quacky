import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string(),

    S3_ENDPOINT: z.string(),
    S3_BUCKET_NAME: z.string(),
    S3_ACCESS_KEY_ID: z.string(),
    S3_SECRET_ACCESS_KEY: z.string(),
    S3_REGION: z.string(),

    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.string(),
    BETTER_AUTH_TRUSTED_ORIGINS: z.string().default("http://localhost:3000").transform((str) => str.split(",").map(s => s.trim())),

    GITHUB_CLIENT_ID: z.string(),
    GITHUB_CLIENT_SECRET: z.string(),

    RESEND_API_KEY: z.string(),
    EMAIL_FROM: z.string(),

    DISCORD_WEBHOOK_URL: z.string(),

    APP_VERSION: z.string().default("dev"),
    APP_BUILD: z.string().default("dev build"),
  },

  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
