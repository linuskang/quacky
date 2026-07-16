import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/server/auth"
import { getStorageKey, uploadObject } from "@/server/storage"
import { Up } from "@/server/upstream"
import { prisma } from "@/server/prisma"
import { env } from "@/env"

export async function GET(req: NextRequest) {
    const session = await getSession()
    if (!session) {
        return new NextResponse(
            "Unauthorised",
            { status: 401 }
        )
    }
    const shorts = await prisma.short.findMany({
        where: {
            flagged: false,
        },
        orderBy: {
            createdAt: "desc",
        },
        select: {
            id: true,
            description: true,
            url: true,
            user: {
                select: {
                    id: true,
                    username: true,
                }
            }
        }
    })

    return NextResponse.json(shorts)
}

export async function POST(req: NextRequest) {
    const session = await getSession()

    if (!session) {
        return new NextResponse(
            "Unauthorised",
            { status: 401 }
        )
    }

    const data = await req.formData()
    const description = data.get("description") as string

    const video = data.get("video") as File

    if (!video) {
        return new NextResponse(
            "Video is required",
            { status: 400 }
        )
    }

    const key = getStorageKey(session.user.id, crypto.randomUUID())

    await uploadObject({
        key,
        body: Buffer.from(await video.arrayBuffer()),
        contentType: video.type,
    })

    const short = await prisma.short.create({
        data: {
            userId: session.user.id,
            description: description,
            url: key,
        }
    })

    await Up.ingest({
        title: "New short posted by " + session.user.username,
        content: description,
        fields: [
            {
                name: "Posted By",
                value: session.user.username,
            },
            {
                name: "Poster Email",
                value: session.user.email,
            }
        ],
        icon: "‼️",
        actions: [
            {
                title: "View short",
                type: "default",
                url: `${env.BETTER_AUTH_URL}/shorts/${short.id}`,
            }
        ]
    })

    return NextResponse.json({
        success: true,
        shortId: short.id,
    })
}