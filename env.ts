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
        },

        experimental__runtimeEnv: {},
        emptyStringAsUndefined: true,

    }
);
