"use client"

import { useEffect, useState } from "react"
import axios from "axios"

import { Title, Subtitle } from "@/components/text"
import { SearchBar } from "@/components/search-bar"
import Link from "next/link"
import { CategoryList, type CategoryData } from "./category-list"
import { ItemList, type ItemData } from "./item-list"
import { WishlistWidget } from "@/components/widgets/wishlist"
import { PageLayout, PageRight, PageCenter } from "@/components/page-layout"
import { WishlistProvider } from "./wishlist-context"

type ShopApiItem = Omit<ItemData, "sufficient">

const categories: CategoryData[] = [
    {
        id: "all",
        imageUrl: "/goose/Science Lab Coat.png",
        title: "All",
    },
    {
        id: "experiences",
        imageUrl: "/goose/Music Dancing 1.png",
        title: "Experiences",
    },
    {
        id: "hardware",
        imageUrl: "/goose/Laptop.png",
        title: "Subscriptions",
    },
    {
        id: "swag",
        imageUrl: "/goose/Aquafest Whale 2.png",
        title: "Swag",
    },
    {
        id: "grants",
        imageUrl: "/goose/Music Dancing 2b.png",
        title: "Vouchers",
    },
]

export default function Shop() {
    const [items, setItems] = useState<ItemData[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        axios
            .get("/api/shop")
            .then((res) => {
                const rawItems: ShopApiItem[] = res.data.items ?? []
                const points: number = res.data.points ?? 0

                setItems(
                    rawItems.map((item) => ({
                        ...item,
                        sufficient: points >= item.price,
                    }))
                )
            })
            .catch(() => setItems([]))
            .finally(() => setLoading(false))
    }, [])

    const newItems = items.filter((item) => !item.featured)
    const featuredItems = items.filter((item) => item.featured)

    return (
        <WishlistProvider>
            <div className="w-[calc(100vw-2rem)] max-w-none self-center lg:w-[calc(100vw-19rem)] lg:translate-x-[8.5rem]">
                <Title>THE SHOP👾</Title>
                <div className="mt-4 mb-6 flex w-full max-w-lg items-center">
                    <SearchBar
                        className="h-12 !text-lg"
                        onChange={(e) => {
                            e.preventDefault()
                            console.log(e.currentTarget.value)
                        }}
                    />
                </div>

                <div className="flex flex-col w-full max-w-7xl">
                    <Title>Categories</Title>

                    <CategoryList categories={categories} />
                </div>

                {loading ? (
                    <p className="mt-6 text-sm text-muted-foreground">loading...</p>
                ) : (
                    <>
                        <div className="space-y-4">
                            <div className="mt-6 flex items-center justify-start">
                                <Subtitle>New to the shop</Subtitle>

                                <Link
                                    href="/shop/category/new"
                                    className="ml-2 text-sm text-primary/80 underline hover:text-primary"
                                >
                                    View all
                                </Link>
                            </div>

                            <ItemList items={newItems} />
                        </div>

                        <div className="space-y-4">
                            <div className="mt-6 flex items-center justify-start">
                                <Subtitle>Featured by Staff</Subtitle>

                                <Link
                                    href="/shop/category/new"
                                    className="ml-2 text-sm text-primary/80 underline hover:text-primary"
                                >
                                    View all
                                </Link>
                            </div>

                            <ItemList items={featuredItems} />
                        </div>
                    </>
                )}
            </div>
            <PageRight>
                <WishlistWidget />
            </PageRight>
        </WishlistProvider>

    )
}
