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

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/server/prisma"
import { getSession } from "@/server/auth"
import { Up } from "@/server/upstream"

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getSession()

    if (!session) {
        return new NextResponse("Unauthorized", {
            status: 401,
        })
    }

    const { id } = await params

    const item = await prisma.shopItem.findUnique({
        where: {
            id,
        },
    })

    if (!item) {
        return new NextResponse("Not Found", {
            status: 404,
        })
    }

    return NextResponse.json(item)
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getSession()
    if (!session) {
        return new NextResponse("Unauthorized", {
            status: 401,
        })
    }

    const { id } = await params

    const item = await prisma.shopItem.findUnique({
        where: { id },
    })

    if (!item) {
        return new NextResponse("Not Found", {
            status: 404,
        })
    }

    await Up.ingest({
        title: `${session.user.email} purchased an item`,
        icon: "💴",
        content: `User ${session.user.email} purchased an item.`,
        fields: [
            {
                name: "User ID",
                value: session.user.id,
            },
            {
                name: "User Email",
                value: session.user.email,
            },
            {
                name: "Item ID",
                value: item.id,
            },
            {
                name: "Item Name",
                value: item.name,
            },
        ],
    })

    // need to implement buy logic,
    // for example:
    // - remove balance, remove stock, etc.

    return NextResponse.json({
        msg: "cool",
    })
}

export async function PATCH(
    _req: NextRequest,
    {
        params,
    }: {
        params: Promise<{ id: string }>
    }
) {
    const session = await getSession()
    if (!session) {
        return NextResponse.json({
            code: 401,
            success: false,
            message: "Unauthorised",
        })
    }

    if (session.user.role !== "admin") {
        return NextResponse.json({
            code: 403,
            success: false,
            message: "You do not have permission to access this endpoint",
        })
    }

    const { id } = await params

    const body = (await _req.json()) as {
        name?: string
        description?: string
        price?: number
        available?: boolean
        category?: string
        featured?: boolean
        stock?: number
        imageUrl?: string
    }

    const item = await prisma.shopItem.update({
        where: {
            id,
        },
        data: {
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

    if (!item) {
        return NextResponse.json({
            code: 404,
            success: false,
            message: "Item not found",
        })
    }

    await Up.ingest({
        title: "Shop item updated",
        content: `A shop item has been updated: ${item.name}`,
        icon: "🛠️",
        fields: [
            {
                name: "Name",
                value: item.name,
            },
            {
                name: "Updated By",
                value: session.user.email,
            },
        ],
        data: {
            updatedFields: body,
            item,
        },
    })

    return NextResponse.json({
        code: 200,
        success: true,
        item,
    })
}

export async function DELETE(
    _req: NextRequest,
    {
        params,
    }: {
        params: Promise<{ id: string }>
    }
) {
    const session = await getSession()
    if (!session) {
        return NextResponse.json({
            code: 401,
            success: false,
            message: "Unauthorised",
        })
    }

    if (session.user.role !== "admin") {
        return NextResponse.json({
            code: 403,
            success: false,
            message: "You do not have permission to access this endpoint",
        })
    }

    const { id } = await params

    const item = await prisma.shopItem.delete({
        where: {
            id,
        },
    })

    if (!item) {
        return NextResponse.json({
            code: 404,
            success: false,
            message: "Item not found",
        })
    }

    await Up.ingest({
        title: "Shop item deleted",
        content: `A shop item has been deleted: ${item.name}`,
        icon: "🗑️",
        fields: [
            {
                name: "Name",
                value: item.name,
            },
            {
                name: "Deleted By",
                value: session.user.email,
            },
        ],
        data: {
            item,
        },
    })

    return NextResponse.json({
        code: 200,
        success: true,
    })
}
