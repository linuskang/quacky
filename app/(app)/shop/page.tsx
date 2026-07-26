"use client"

import { Title, Subtitle } from "@/components/text"
import { SearchBar } from "@/components/search-bar"
import Link from "next/link"
import { CategoryList, type CategoryData } from "./category-list"
import { ItemList, type ItemData } from "./item-list"
import { WishlistWidget } from "@/components/widgets/wishlist"
import { PageLayout, PageRight, PageCenter } from "@/components/page-layout"
import { WishlistProvider } from "./wishlist-context"

const newItems: ItemData[] = [
    {
        id: "travel-stipends",
        description:
            "Get 5 USD in travel stipends to Outpost, a four-day hackathon followed by a showcase in San Francisco.",
        featured: false,
        imageUrl: "/goose/Backpack.png",
        name: "Outpost Travel Stipends",
        price: 10,
        sufficient: true,
        stock: 10,
    },
    {
        id: "study-buddy",
        description:
            "Bring a focused little friend to your desk for late-night study sessions.",
        featured: false,
        imageUrl: "/goose/Book.png",
        name: "Study Buddy Goose",
        price: 18,
        sufficient: true,
        stock: 7,
    },
    {
        id: "camera-goose",
        description:
            "A limited camera goose collectible for photographers and memory makers.",
        featured: false,
        imageUrl: "/goose/Camera.png",
        name: "Camera Goose",
        price: 24,
        sufficient: false,
        stock: 3,
    },

]

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

const featuredItems: ItemData[] = [
    {
        id: "celebration-goose",
        description:
            "The party starter. Redeem this festive goose for your next big celebration.",
        featured: true,
        imageUrl: "/goose/Celebration.png",
        name: "Celebration Goose",
        price: 30,
        sufficient: true,
        stock: 4,
    },
    {
        id: "winner-medal",
        description:
            "A shiny reward reserved for champions, competitors, and excellent teammates.",
        featured: true,
        imageUrl: "/goose/Winner Medal.png",
        name: "Winner Medal",
        price: 35,
        sufficient: false,
        stock: 8,
    },
    {
        id: "laptop-goose",
        description:
            "A coding companion that ships bugs, reviews pull requests, and guards your desk.",
        featured: true,
        imageUrl: "/goose/Laptop.png",
        name: "Laptop Goose",
        price: 42,
        sufficient: true,
        stock: 0,
    },
]

export default function Shop() {
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

                <WishlistWidget />
            </div>
            <PageRight>
                <WishlistWidget />
            </PageRight>
        </WishlistProvider>

    )
}
