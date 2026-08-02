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
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/server/prisma"
import { Up } from "@/server/upstream"

export async function GET(_req: NextRequest) {
    const sess = await getSession()
    if (!sess) {
        return NextResponse.json({
            code: 401,
            success: false,
            message: "Unauthorised",
        })
    }

    const [items, user] = await Promise.all([
        prisma.shopItem.findMany({
            where: {
                available: true,
            },
        }),
        prisma.user.findUnique({
            where: {
                id: sess.user.id,
            },
            select: {
                points: true,
            },
        }),
    ])

    return NextResponse.json({
        code: 200,
        success: true,
        items,
        points: user?.points ?? 0,
    })
}

export async function POST(req: NextRequest) {
    const sess = await getSession()
    if (!sess) {
        return NextResponse.json(
            {
                code: 401,
                success: false,
                message: "Unauthorised",
            },
            {
                status: 401,
            }
        )
    }

    if (sess.user.role !== "admin") {
        return NextResponse.json(
            {
                code: 403,
                success: false,
                message: "Forbidden",
            },
            {
                status: 403,
            }
        )
    }

    const body = (await req.json()) as {
        name: string
        description: string
        price: number
        available: boolean
        category: string
        featured: boolean
        stock: number
        imageUrl: string
    }

    const res = await prisma.shopItem.create({
        data: {
            addedByUserId: sess.user.id,
            name: body.name,
            description: body.description,
            price: body.price,
            available: body.available,
            category: body.category,
            featured: body.featured,
            stock: body.stock,
            imageUrl: body.imageUrl,
        },
    })

    if (!res) {
        return NextResponse.json({
            code: 500,
            success: false,
            message: "Internal server error",
        })
    }

    await Up.ingest({
        title: "New shop item added",
        content: `A new shop item has been added: ${body.name}`,
        icon: "🛒",
        fields: [
            {
                name: "Name",
                value: body.name,
            },
            {
                name: "Description",
                value: body.description,
            },
            {
                name: "Price",
                value: body.price.toString(),
            },
            {
                name: "Stock",
                value: body.stock.toString(),
            },
            {
                name: "Added By",
                value: sess.user.email,
            },
        ],
        data: {
            res,
            sess,
            body,
        },
    })

    return NextResponse.json({
        code: 201,
        success: true,
        result: res,
    })
}
