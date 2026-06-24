import { env } from "@/env";
import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json(
        {
            orgName: env.ORG_NAME,
            version: env.VERSION,
            apiVersions: [
                {
                    version: "1",
                    endpoint: "/api/v1",
                }
            ],
        }
    )
}