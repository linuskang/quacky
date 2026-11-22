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

import { NextRequest } from "next/server"
import { getSession } from "@/server/auth"
import { prisma } from "@/server/prisma"
import { Up } from "@/server/upstream"
import { Response } from "@/lib/responses"
import { NotificationService } from "@/server/helpers"

export async function POST(
    req: NextRequest,
    {
        params,
    }: {
        params: Promise<{
            id: string
        }>
    }
) {
    const session = await getSession()

    if (!session) {
        return Response.Unauthorized()
    }

    const { id } = await params

    const item = await prisma.shopItem.findUnique({
        where: {
            id,
        },
    })

    if (!item) return Response.NotFound("Item not found")

    if (item.stock <= 0) {
        return Response.BadRequest("Item is out of stock")
    }

    // basically this isnt done yet, i need to do the admin side api as well for the
    // status changes for staff. need to wire into the ui. shop ui aint even done yet, so yea.

    // im cooked.

    const body = (await req.json()) as {
        quantity: number
    }

    if (!body.quantity) {
        return Response.BadRequest()
    }

    const purchase = await prisma.shopPurchase.create({
        data: {
            userId: session.user.id,
            itemId: item.id,
            quantity: body.quantity,
        },
    })

    const total = item.price * body.quantity

    await prisma.user.update({
        where: {
            id: session.user.id,
        },
        data: {
            points: {
                decrement: total,
            },
        },
    })

    await prisma.shopItem.update({
        where: {
            id: item.id,
        },
        data: {
            stock: {
                decrement: body.quantity,
            },
        },
    })

    await NotificationService.send(
        session.user.id,
        'quacky',
        `Hey!\n\nThanks for purchasing ${item.name} in the shop (${body.quantity}x ${item.name} for $${total})!\n\nYour order is now in the queue for review. This may take some time, so sit tight.\n\nYou will be notified here once your order status is updated.\n\n*This is an automated message from Quacky, please do not reply to this message.*`
    )

    await Up.ingest({
        title: "Shop Purchase",
        icon: "👜",
        description: `${session.user.name} purchased ${body.quantity}x ${item.name}`,
        fields: [
            {
                title: "User",
                value: session.user.email,
            },
            {
                title: "Item",
                value: item.name,
            },
            {
                title: "Quantity",
                value: body.quantity.toString(),
            },
            {
                title: "Item ID",
                value: item.id,
            },
        ],
        data: {
            purchase,
            item,
            session,
        },
    })

    return Response.Success(purchase)
}
