import { getSession } from "@/server/auth";
import { prisma } from "@/server/prisma";
import { Response } from "@/lib/responses";
import { Up } from "@/server/upstream";
import { NotificationService } from "@/server/helpers";

import { NextRequest } from "next/server";

export async function GET() {
    const session = await getSession()

    if (!session) {
        return Response.Unauthorized()
    }

    if (session.user.role !== "admin") {
        return Response.Forbidden()
    }

    const pendingOrders = await prisma.shopPurchase.findMany({
        where: {
            status: "PENDING",
        },
        include: {
            item: true,
            user: true,
        },
    })

    return Response.Success(pendingOrders)
}

export async function POST(req: NextRequest) {
    const session = await getSession()

    if (!session) {
        return Response.Unauthorized()
    }

    if (session.user.role !== "admin") {
        return Response.Forbidden()
    }

    const { orderId, actionOrderStatus } = await req.json() as {
        orderId: string
        actionOrderStatus: "FULFILLED" | "REJECTED"
    }

    const order = await prisma.shopPurchase.findUnique({
        where: {
            id: orderId,
        },
        include: {
            item: true,
        }
    })

    if (!order) {
        return Response.NotFound()
    }

    const updatedOrderStatus = await prisma.shopPurchase.update({
        where: {
            id: orderId,
        },
        data: {
            status: actionOrderStatus,
        }
    })

    if (actionOrderStatus === "REJECTED") {
        await prisma.user.update({
            where: {
                id: order.userId,
            },
            data: {
                points: {
                    increment: order.item.price * order.quantity,
                },
            },
        })
    }

    if (actionOrderStatus === "FULFILLED") {
        await NotificationService.send(
            order.userId,
            "quacky",
            `Hey!\n\nYour order for ${order.item.name} (Quantity: ${order.quantity}) has been fulfilled!\n\nOrder ID: ${order.id}\n\nPlease ask a teacher or Staffing Member for your item if you have not yet recieved it.`
        )
    } else if (actionOrderStatus === "REJECTED") {
        await NotificationService.send(
            order.userId,
            "quacky",
            `Your order for ${order.item.name} (Quantity: ${order.quantity}) has been rejected.\n\nOrder ID: ${order.id}\n\nYou have been refunded $${order.item.price * order.quantity}.`
        )
    }

    await Up.ingest({
        title: `Order ${actionOrderStatus}: ${order.item.name}`,
        description: `Order ${actionOrderStatus}: ${order.item.name} (Quantity: ${order.quantity}) for ${session.user.name} (${session.user.email})`,
        fields: [
            {
                title: "Order ID",
                value: order.id,
            },
            {
                title: "Item Name",
                value: order.item.name,
            },
            {
                title: "Quantity",
                value: order.quantity.toString(),
            },
            {
                title: "Order Status",
                value: actionOrderStatus,
            },
            {
                title: "Actioned by",
                value: session.user.name,
            },
        ],
        data: {
            session,
            updatedOrderStatus,
        }
    })

    return Response.Success("Done!")
}

export async function DELETE(req: NextRequest) {
    const session = await getSession()

    if (!session) {
        return Response.Unauthorized()
    }

    if (session.user.role !== "admin") {
        return Response.Forbidden()
    }

    const { orderId } = await req.json() as {
        orderId: string
    }

    const order = await prisma.shopPurchase.findUnique({
        where: {
            id: orderId,
        },
        include: {
            item: true,
            user: true,
        }
    })

    if (!order) {
        return Response.NotFound()
    }

    await prisma.shopPurchase.delete({
        where: {
            id: orderId,
        }
    })

    await Up.ingest({
        title: `Order Deleted: ${order.item.name}`,
        description: `Order Deleted: ${order.item.name} (Quantity: ${order.quantity}) for ${session.user.name} (${session.user.email})`,
        fields: [
            {
                title: "Order ID",
                value: order.id,
            },
            {
                title: "Item Name",
                value: order.item.name,
            },
            {
                title: "Quantity",
                value: order.quantity.toString(),
            },
            {
                title: "Actioned by",
                value: session.user.name,
            },
            {
                title: "Order Username",
                value: order.user.username,
            }
        ],
        data: {
            session,
            order,
        }
    })

    return Response.Success("Deleted order!")
}
