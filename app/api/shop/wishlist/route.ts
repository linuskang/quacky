import { NextRequest } from "next/server";
import { getSession } from "@/server/auth";
import { prisma } from "@/server/prisma";
import { Unauthorized, BadRequest, Success } from "@/lib/responses";

export async function GET(req: NextRequest) {
    const session = await getSession();
    if (!session) {
        return Unauthorized();
    }

    const [wishlist, user] = await Promise.all([
        prisma.shopWishlist.findMany({
            where: {
                userId: session.user.id,
            },
            include: {
                item: true,
            }
        }),
        prisma.user.findUnique({
            where: {
                id: session.user.id,
            },
            select: {
                points: true,
            }
        })
    ])

    return Success({
        items: wishlist,
        points: user?.points ?? 0,
    });
}

export async function POST(req: NextRequest) {
    const session = await getSession();
    if (!session) {
        return Unauthorized();
    }

    const body = await req.json() as {
        itemId: string;
    }

    if (!body.itemId) {
        return BadRequest();
    }

    const existing = await prisma.shopWishlist.findUnique({
        where: {
            userId_itemId: {
                userId: session.user.id,
                itemId: body.itemId,
            }
        }
    })

    if (existing) {
        return Success(existing);
    }

    const entry = await prisma.shopWishlist.create({
        data: {
            userId: session.user.id,
            itemId: body.itemId,
        },
        include: {
            item: true,
        }
    })

    return Success(entry);
}

export async function DELETE(req: NextRequest) {
    const session = await getSession();
    if (!session) {
        return Unauthorized();
    }

    const body = await req.json() as {
        itemId: string;
    }

    if (!body.itemId) {
        return BadRequest();
    }

    await prisma.shopWishlist.deleteMany({
        where: {
            userId: session.user.id,
            itemId: body.itemId,
        }
    })

    return Success({ deleted: true });
}