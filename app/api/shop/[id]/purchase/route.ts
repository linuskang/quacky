import { NextRequest } from "next/server";
import { getSession } from "@/server/auth";
import { prisma } from "@/server/prisma";
import { Up } from "@/server/upstream";
import { Unauthorized, Success, NotFound, BadRequest } from "@/lib/responses";

export async function POST(req: NextRequest, { params }: {
    params: Promise<{
        id: string;
    }>
}) {
    const session = await getSession();

    if (!session) {
        return Unauthorized()
    }

    const { id } = await params;

    const item = await prisma.shopItem.findUnique({
        where: {
            id
        }
    })

    if (!item) return NotFound("Item not found");

    // basically this isnt done yet, i need to do the admin side api as well for the
    // status changes for staff. need to wire into the ui. shop ui aint even done yet, so yea.

    // im cooked.

    const body = await req.json() as {
        quantity: number;
    }

    if (!body.quantity) {
        return BadRequest();
    }

    const purchase = await prisma.shopPurchase.create({
        data: {
            userId: session.user.id,
            itemId: item.id,
            quantity: body.quantity
        }
    })

    await Up.ingest({
        title: "Shop Purchase",
        icon: "👜",
        content: `${session.user.name} purchased ${body.quantity}x ${item.name}`,
        fields: [
            {
                name: "User",
                value: session.user.email,
            },
            {
                name: "Item",
                value: item.name,
            },
            {
                name: "Quantity",
                value: body.quantity.toString(),
            },
            {
                name: "Item ID",
                value: item.id,
            }
        ],
        data: {
            purchase,
            item,
            session
        }
    })

    return Success(purchase);
}