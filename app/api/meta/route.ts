import { env } from "@/env";
import { NextResponse } from "next/server";
import { version, rules } from "@/lib/var";

export async function GET() {
    return NextResponse.json(
        {
            org: {
                name: env.ORG_NAME,
                rules
            },
            version: version,
        }
    )
}