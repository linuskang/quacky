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

import { Suspense } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { keepPreviousData } from "@tanstack/react-query"
import { trpc } from "@/lib/trpc"

import { PageLayout } from "@/components/page-layout"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 10

function getPageItems(page: number, totalPages: number): Array<number | "ellipsis"> {
    if (totalPages <= 5) {
        return Array.from({ length: totalPages }, (_, index) => index + 1)
    }

    const pages = new Set<number>([1, totalPages, page - 1, page, page + 1])
    const sorted = Array.from(pages)
        .filter((value) => value >= 1 && value <= totalPages)
        .sort((a, b) => a - b)

    const items: Array<number | "ellipsis"> = []
    for (let i = 0; i < sorted.length; i++) {
        const current = sorted[i]
        const previous = sorted[i - 1]
        if (previous !== undefined && current - previous > 1) {
            items.push("ellipsis")
        }
        items.push(current)
    }
    return items
}

function MyOrdersContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const parsedPage = Number(searchParams.get("page"))
    const requestedPage =
        Number.isInteger(parsedPage) && parsedPage >= 1 ? parsedPage : 1

    const { data, isLoading: loading, isPlaceholderData } =
        trpc.shop.myOrders.useQuery(
            { page: requestedPage, pageSize: PAGE_SIZE },
            { placeholderData: keepPreviousData }
        )

    const orders = data?.orders ?? []
    const page = data?.page ?? requestedPage
    const totalPages = data?.totalPages ?? 1
    const total = data?.total ?? 0

    function goToPage(targetPage: number) {
        const clamped = Math.min(totalPages, Math.max(1, targetPage))
        if (clamped === page) return
        router.push(
            clamped === 1 ? "/shop/my-orders" : `/shop/my-orders?page=${clamped}`
        )
    }

    const pageItems = getPageItems(page, totalPages)

    return (
        <PageLayout>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h1 className="text-2xl font-extrabold">My Orders</h1>
                {totalPages > 1 && (
                    <p className="text-sm font-semibold text-muted-foreground">
                        Page {page} of {totalPages} ({total} orders)
                    </p>
                )}
            </div>

            {loading ? (
                <p className="mt-4 text-sm text-muted-foreground">
                    Loading orders...
                </p>
            ) : orders.length === 0 ? (
                <p className="mt-4 text-sm text-muted-foreground">
                    You haven&apos;t made any orders yet.
                </p>
            ) : (
                <>
                    <div
                        className={cn(
                            "mt-4 flex flex-col gap-3 transition-opacity",
                            isPlaceholderData && "opacity-60"
                        )}
                    >
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
                                    {order.status === "REJECTED" && (
                                        <p className="text-xs text-muted-foreground">
                                            Your order was rejected, you have been refunded ${order.item.price * order.quantity}.
                                        </p>
                                    )}
                                    {order.status === "FULFILLED" && (
                                        <p className="text-xs text-muted-foreground">
                                            Your order has been accepted! please ask a teacher or Staffing Member for your item.
                                        </p>
                                    )}
                                    {order.status === "PENDING" && (
                                        <p className="text-xs text-muted-foreground">
                                            Your order is in the queue. Please hold! a staffing member will review your order shortly.
                                        </p>
                                    )}
                                </div>

                                <div className="flex flex-col items-end gap-1">
                                    <span className="text-sm font-extrabold">
                                        ${order.item.price * order.quantity}
                                    </span>
                                    <Badge
                                        variant="secondary"
                                        className={cn(
                                            "rounded-full px-3 py-1 text-xs font-semibold",
                                            order.status === "PENDING" &&
                                                "bg-primary-2 text-yellow-800",
                                            order.status === "FULFILLED" &&
                                                "bg-chart-1 text-green-800",
                                            order.status === "REJECTED" &&
                                                "bg-destructive text-red-800"
                                        )}
                                    >
                                        {order.status}
                                    </Badge>
                                </div>
                            </Card>
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <Pagination className="mt-6">
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        href={
                                            page > 2
                                                ? `/shop/my-orders?page=${page - 1}`
                                                : "/shop/my-orders"
                                        }
                                        aria-disabled={page <= 1}
                                        className={cn(
                                            page <= 1 &&
                                                "pointer-events-none opacity-50"
                                        )}
                                        onClick={(event) => {
                                            event.preventDefault()
                                            if (page > 1) goToPage(page - 1)
                                        }}
                                    />
                                </PaginationItem>

                                {pageItems.map((item, index) =>
                                    item === "ellipsis" ? (
                                        <PaginationItem key={`ellipsis-${index}`}>
                                            <PaginationEllipsis />
                                        </PaginationItem>
                                    ) : (
                                        <PaginationItem key={item}>
                                            <PaginationLink
                                                href={
                                                    item === 1
                                                        ? "/shop/my-orders"
                                                        : `/shop/my-orders?page=${item}`
                                                }
                                                isActive={item === page}
                                                onClick={(event) => {
                                                    event.preventDefault()
                                                    goToPage(item)
                                                }}
                                            >
                                                {item}
                                            </PaginationLink>
                                        </PaginationItem>
                                    )
                                )}

                                <PaginationItem>
                                    <PaginationNext
                                        href={`/shop/my-orders?page=${Math.min(totalPages, page + 1)}`}
                                        aria-disabled={page >= totalPages}
                                        className={cn(
                                            page >= totalPages &&
                                                "pointer-events-none opacity-50"
                                        )}
                                        onClick={(event) => {
                                            event.preventDefault()
                                            if (page < totalPages)
                                                goToPage(page + 1)
                                        }}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    )}
                </>
            )}
        </PageLayout>
    )
}

export default function MyOrders() {
    return (
        <Suspense
            fallback={
                <PageLayout>
                    <h1 className="text-2xl font-extrabold">My Orders</h1>
                    <p className="mt-4 text-sm text-muted-foreground">
                        Loading orders...
                    </p>
                </PageLayout>
            }
        >
            <MyOrdersContent />
        </Suspense>
    )
}
