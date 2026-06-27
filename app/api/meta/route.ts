import { env } from "@/env";
import { NextResponse } from "next/server";
import { version, rules } from "@/lib/var";
import { prisma } from "@/server/prisma";

export async function GET() {

    const posts = await prisma.post.count()
    const users = await prisma.user.count()

    return NextResponse.json(
        {
            org: {
                name: env.ORG_NAME,
                description: env.DESCRIPTION,
                rules
            },
            version: version,
            stats: {
                posts,
                users
            }
        }
    )
}