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

import { NextRequest } from "next/server";
import { getSession } from "@/server/auth";
import { prisma } from "@/server/prisma";
import { Response } from "@/lib/responses";

export async function GET(req: NextRequest) {
    const session = await getSession();
    if (!session) {
        return Response.Unauthorized();
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

    return Response.Success({
        items: wishlist,
        points: user?.points ?? 0,
    });
}

export async function POST(req: NextRequest) {
    const session = await getSession();
    if (!session) {
        return Response.Unauthorized();
    }

    const body = await req.json() as {
        itemId: string;
    }

    if (!body.itemId) {
        return Response.BadRequest();
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
        return Response.Success(existing);
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

    return Response.Success(entry);
}

export async function DELETE(req: NextRequest) {
    const session = await getSession();
    if (!session) {
        return Response.Unauthorized();
    }

    const body = await req.json() as {
        itemId: string;
    }

    if (!body.itemId) {
        return Response.BadRequest();
    }

    await prisma.shopWishlist.deleteMany({
        where: {
            userId: session.user.id,
            itemId: body.itemId,
        }
    })

    return Response.Success({ deleted: true });
}