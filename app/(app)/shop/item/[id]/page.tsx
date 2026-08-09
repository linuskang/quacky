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

import { Button } from "@/components/ui/button"

type ShopItem = {
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

import { PageLayout, PageCenter } from "@/components/page-layout"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Loading from "@/components/loading"
import Image from "next/image"
import { toast } from "sonner"
import { Minus, Plus } from "lucide-react"

import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

const MAX_PER_ORDER = 10

export default function Shop() {
    const [shopItem, setShopItem] = useState<ShopItem | null>(null)
    const [balance, setBalance] = useState<number | null>(0)
    const [quantity, setQuantity] = useState(1)
    const [buying, setBuying] = useState(false)
    const [loading, setLoading] = useState(true)
    const params = useParams()
    const router = useRouter()

    async function getitem() {
        try {
            const res = await axios.get(`/api/shop/${params.id}`)
            if (res.status === 200) {
                setShopItem(res.data)
            }
        } catch {
            setShopItem(null)
        } finally {
            setLoading(false)
        }
    }

    async function getBalance() {
        try {
            const res = await axios.get("/api/me")
            if (res.status === 200) {
                setBalance(res.data.balance)
            }
        } catch {
            setBalance(null)
        }
    }

    useEffect(() => {
        getitem()
        getBalance()
    }, [params.id])

    async function buy() {
        if (!shopItem) return

        setBuying(true)
        try {
            await axios.post(`/api/shop/${shopItem.id}/purchase`, {
                quantity,
            })
            toast.success("Purchase complete!")
            await getBalance()
        } catch {
            toast.error("Something went wrong. Please try again.")
        } finally {
            setBuying(false)
        }
    }

    if (loading) {
        return <Loading />
    }

    if (!shopItem) {
        return (
            <PageLayout>
                <PageCenter>
                    <p>Item not found</p>
                    <Button
                        variant="secondary"
                        onClick={() => {
                            router.push("/shop")
                        }}
                    >
                        Back to shop
                    </Button>
                </PageCenter>
            </PageLayout>
        )
    }

    const maxQuantity = Math.max(1, Math.min(MAX_PER_ORDER, shopItem.stock))
    const total = shopItem.price * quantity
    const outOfStock = shopItem.stock <= 0 || !shopItem.available
    const insufficient = balance !== null && total > balance

    return (
        <div className="flex w-[calc(100vw-2rem)] max-w-6xl flex-col self-center px-4 py-4">
            <div className="flex justify-center">
                <Button
                    variant="secondary"
                    onClick={() => {
                        router.push("/shop")
                    }}
                >
                    Back to shop
                </Button>
            </div>

            <Card className="mt-4 overflow-hidden p-0">
                <div className="grid md:grid-cols-2">
                    <div className="flex flex-col gap-4 p-6">
                        <div className="relative aspect-square overflow-hidden rounded-lg bg-card-primary">
                            <Image
                                src={shopItem.imageUrl}
                                alt={shopItem.name}
                                fill
                                sizes="(max-width: 768px) 100vw, 480px"
                                className="object-contain p-4"
                            />
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-2xl font-extrabold">
                                {shopItem.name}
                            </h1>
                            <p className="text-sm leading-relaxed font-medium text-muted-foreground">
                                {shopItem.description}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-6 border-t-2 border-border p-6 md:border-t-0 md:border-l-2">
                        <div className="space-y-3">
                            <h2 className="text-lg font-bold">
                                Complete your order
                            </h2>

                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">
                                    Quantity
                                </Label>
                                <div className="flex items-center gap-3">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        size="icon"
                                        aria-label="Decrease quantity"
                                        disabled={quantity <= 1 || outOfStock}
                                        onClick={() =>
                                            setQuantity((q) => q - 1)
                                        }
                                    >
                                        <Minus />
                                    </Button>
                                    <span className="w-8 text-center text-lg font-bold">
                                        {quantity}
                                    </span>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        size="icon"
                                        aria-label="Increase quantity"
                                        disabled={
                                            quantity >= maxQuantity ||
                                            outOfStock
                                        }
                                        onClick={() =>
                                            setQuantity((q) => q + 1)
                                        }
                                    >
                                        <Plus />
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Max {maxQuantity} per order
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-1 flex-col gap-3 rounded-lg border-2 border-border p-4">
                            <h3 className="text-sm font-bold uppercase tracking-wide">
                                Order Summary
                            </h3>

                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">
                                    Current balance
                                </span>
                                <span className="font-semibold">
                                    {balance === null ? "—" : `$${balance}`}
                                </span>
                            </div>

                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">
                                    Base price
                                </span>
                                <span className="font-semibold">
                                    ${shopItem.price}
                                </span>
                            </div>

                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">
                                    Quantity
                                </span>
                                <span className="font-semibold">
                                    {quantity}
                                </span>
                            </div>

                            <div className="flex justify-between border-t-2 border-border pt-3 text-base">
                                <span className="font-bold">Total</span>
                                <span className="font-extrabold">
                                    ${total}
                                </span>
                            </div>

                            <div className="mt-2 flex flex-col gap-2">
                                <Button
                                    variant="primary"
                                    className="h-10 rounded-full text-base font-bold"
                                    disabled={
                                        outOfStock ||
                                        insufficient ||
                                        buying
                                    }
                                    onClick={buy}
                                >
                                    {buying
                                        ? "Purchasing..."
                                        : outOfStock
                                            ? "Out of stock"
                                            : "Buy"}
                                </Button>
                                {insufficient && !outOfStock && (
                                    <p className="text-center text-xs font-medium text-destructive">
                                        You need ${total - (balance ?? 0)} more
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    )
}
