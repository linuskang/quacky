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

"use client"

import axios from "axios"
import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type PurchaseStatus = "PENDING" | "FULFILLED" | "REJECTED"

type Order = {
    id: string
    status: PurchaseStatus
    quantity: number
    createdAt: string
    item: {
        id: string
        name: string
        description: string
        imageUrl: string
        price: number
        stock: number
        category: string
        available: boolean
        featured: boolean
    }
}

const statusStyles: Record<PurchaseStatus, string> = {
    PENDING: "bg-yellow-500 text-black",
    FULFILLED: "bg-green-600 text-white",
    REJECTED: "bg-red-500 text-white",
}

export default function MyOrders() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        axios
            .get("/api/shop/my-orders")
            .then((res) => setOrders(res.data.data ?? []))
            .catch(() => setOrders([]))
            .finally(() => setLoading(false))
    }, [])

    return (
        <div className="flex w-[calc(100vw-2rem)] max-w-6xl flex-col self-center px-4 py-4">
            <h1 className="text-2xl font-extrabold">My Orders</h1>

            {loading ? (
                <p className="mt-4 text-sm text-muted-foreground">
                    Loading orders...
                </p>
            ) : orders.length === 0 ? (
                <p className="mt-4 text-sm text-muted-foreground">
                    You haven&apos;t made any orders yet.
                </p>
            ) : (
                <div className="mt-4 flex flex-col gap-3">
                    {orders.map((order) => (
                        <Card
                            key={order.id}
                            className="flex flex-row items-center gap-4 p-4 sm:flex-row"
                        >
                            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-card-primary">
                                <Image
                                    src={order.item.imageUrl}
                                    alt={order.item.name}
                                    fill
                                    sizes="80px"
                                    className="object-contain p-1"
                                />
                            </div>

                            <div className="min-w-0 flex-1 space-y-1">
                                <Link
                                    href={`/shop/item/${order.item.id}`}
                                    className="block truncate text-base font-bold hover:underline"
                                >
                                    {order.item.name}
                                </Link>
                                <p className="truncate text-xs text-muted-foreground">
                                    ${order.item.price} × {order.quantity}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {new Date(
                                        order.createdAt
                                    ).toLocaleDateString()}
                                </p>
                            </div>

                            <div className="flex flex-col items-end gap-1">
                                <span className="text-sm font-extrabold">
                                    ${order.item.price * order.quantity}
                                </span>
                                <Badge
                                    variant="secondary"
                                    className={cn(
                                        "rounded-full px-3 py-1 text-xs font-semibold",
                                        statusStyles[order.status]
                                    )}
                                >
                                    {order.status}
                                </Badge>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
