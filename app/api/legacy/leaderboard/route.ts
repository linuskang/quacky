import { NextResponse } from "next/server"

import { getSession } from "@/server/auth"
import { prisma } from "@/server/prisma"

export async function GET() {
    const session = await getSession()

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const users = await prisma.user.findMany({
        where: {
            private: false,
            banned: false,
        },
        select: {
            username: true,
            name: true,
            image: true,
            points: true,
        },
        orderBy: [{ points: "desc" }, { username: "asc" }],
        take: 3,
    })

    return NextResponse.json({ users })
}
