import { NextRequest } from "next/server"
import { z } from "zod"

import { Response } from "@/lib/responses"
import { getSession } from "@/server/auth"
import { prisma } from "@/server/prisma"
import { Up } from "@/server/upstream"

//vibecoded so i can quickly get this feature done.
// will change to be mine later.

const shopItemSchema = z.object({
    name: z.string().trim().min(1),
    description: z.string().trim().min(1),
    price: z.number().int().min(0),
    stock: z.number().int().min(0),
    category: z.string().trim().min(1),
    imageUrl: z.string().trim().min(1),
    available: z.boolean(),
    featured: z.boolean(),
})

const updateSchema = shopItemSchema.partial().extend({
    id: z.string().min(1),
})

async function requireAdmin() {
    const session = await getSession()

    if (!session) return { response: Response.Unauthorized() }
    if (session.user.role !== "admin") return { response: Response.Forbidden() }

    return { session }
}

export async function GET() {
    const auth = await requireAdmin()
    if (auth.response) return auth.response

    const items = await prisma.shopItem.findMany({
        orderBy: [{ available: "desc" }, { createdAt: "desc" }],
    })

    return Response.Success(items)
}

export async function POST(req: NextRequest) {
    const auth = await requireAdmin()
    if (auth.response) return auth.response

    const parsed = shopItemSchema.safeParse(await req.json())
    if (!parsed.success) return Response.BadRequest("Invalid shop item")

    const item = await prisma.shopItem.create({
        data: {
            ...parsed.data,
            addedByUserId: auth.session.user.id,
        },
    })

    await Up.ingest({
        title: "Admin created shop item",
        description: `${auth.session.user.name} created ${item.name}.`,
        icon: "🛒",
        category: "shop.item.created",
        fields: [
            { title: "Item", value: item.name },
            { title: "Price", value: item.price.toString() },
            { title: "Stock", value: item.stock.toString() },
            { title: "Admin", value: auth.session.user.email },
        ],
        data: { item, adminId: auth.session.user.id },
    })

    return Response.Success(item)
}

export async function PATCH(req: NextRequest) {
    const auth = await requireAdmin()
    if (auth.response) return auth.response

    const parsed = updateSchema.safeParse(await req.json())
    if (!parsed.success) return Response.BadRequest("Invalid shop item update")

    const { id, ...data } = parsed.data
    const item = await prisma.shopItem.update({ where: { id }, data })

    await Up.ingest({
        title: "Admin updated shop item",
        description: `${auth.session.user.name} updated ${item.name}.`,
        icon: "🛠️",
        category: "shop.item.updated",
        fields: [
            { title: "Item", value: item.name },
            { title: "Admin", value: auth.session.user.email },
        ],
        data: { item, updatedFields: data, adminId: auth.session.user.id },
    })

    return Response.Success(item)
}

export async function DELETE(req: NextRequest) {
    const auth = await requireAdmin()
    if (auth.response) return auth.response

    const body = await req.json()
    const id = z.string().min(1).safeParse(body?.id)
    if (!id.success) return Response.BadRequest("A shop item id is required")

    const item = await prisma.shopItem.delete({ where: { id: id.data } })

    await Up.ingest({
        title: "Admin deleted shop item",
        description: `${auth.session.user.name} deleted ${item.name}.`,
        icon: "🗑️",
        category: "shop.item.deleted",
        fields: [
            { title: "Item", value: item.name },
            { title: "Admin", value: auth.session.user.email },
        ],
        data: { item, adminId: auth.session.user.id },
    })

    return Response.Success(item)
}
