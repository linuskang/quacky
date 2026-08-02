//   ______                                 __
//  /      \                               /  |
// /$$$$$$  | __    __   ______    _______ $$ |   __  __    __
// $$ |  $$ |/  |  /  | /      \  /       |$$ |  /  |/  |  /  |
// $$ |  $$ |$$ |  $$ | $$$$$$  |/$$$$$$$/ $$ |_/$$/ $$ |  $$ |
// $$ |_ $$ |$$ |  $$ | /    $$ |$$ |      $$   $$<  $$ |  $$ |
// $$ / \$$ |$$ \__$$ |/$$$$$$$ |$$ \_____ $$$$$$  \ $$ \__$$ |
// $$ $$ $$< $$    $$/ $$    $$ |$$       |$$ | $$  |$$    $$ |
//  $$$$$$  | $$$$$$/   $$$$$$$/  $$$$$$$/ $$/   $$/  $$$$$$$ |
//      $$$/                                         /  \__$$ |
//                                                   $$    $$/
//                                                    $$$$$$/
//
// Linus Kang, 2026
// Work is licensed under the CC BY-NC 4.0 license.

import { getSession } from "@/server/auth"
import { NextRequest } from "next/server"
import { prisma } from "@/server/prisma"
import { Response } from "@/lib/responses"
import { Up } from "@/server/upstream"

export async function GET(req: NextRequest) {
    const session = await getSession()

    if (!session) {
        return Response.Unauthorized()
    }

    const suggestions = await prisma.shopSuggestion.findMany({
        where: {
            pending: true,
        },
        select: {
            id: true,
            name: true,
            image: true,
            description: true,
            createdByUserId: true,
            createdAt: true,
            createdBy: {
                select: {
                    id: true,
                    verified: true,
                    role: true,
                    name: true,
                    image: true,
                },
            },
            pending: true,
            shopSuggestionVotes: true,
        },
    })

    return Response.Success(suggestions)
}

export async function PATCH(req: NextRequest) {
    const session = await getSession()
    if (!session) {
        return Response.Unauthorized()
    }

    if (session.user.role !== "admin") {
        return Response.Forbidden()
    }

    const body = (await req.json()) as {
        id: string
        pending: boolean
    }

    if (!body.id) {
        return Response.BadRequest()
    }

    const suggestion = await prisma.shopSuggestion.update({
        where: {
            id: body.id,
        },
        data: {
            pending: body.pending,
        },
    })

    return Response.Success(suggestion)
}

export async function POST(req: NextRequest) {
    const session = await getSession()
    if (!session) {
        return Response.Unauthorized()
    }

    const body = (await req.json()) as {
        name: string
        image: string
        description: string
    }

    if (!body.name || !body.image || !body.description) {
        return Response.BadRequest()
    }

    const suggestion = await prisma.shopSuggestion.create({
        data: {
            name: body.name,
            image: body.image,
            description: body.description,
            createdByUserId: session.user.id,
        },
    })

    await Up.ingest({
        title: "New Shop Suggestion",
        icon: "🛍️",
        content: `A new shop suggestion has been submitted by ${session.user.name}.`,
        category: "shop-suggestion",
        fields: [
            {
                name: "Name",
                value: body.name,
            },
            {
                name: "Image",
                value: body.image,
            },
            {
                name: "Description",
                value: body.description,
            },
            {
                name: "Submitted By",
                value: session.user.email,
            },
        ],
    })

    return Response.Success(suggestion)
}
