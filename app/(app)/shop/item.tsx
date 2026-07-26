"use client"

import Image from "next/image"
import Link from "next/link"
import { Star } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useWishlist } from "./wishlist-context"

type ItemProps = {
    description: string
    featured: boolean
    imageUrl: string
    name: string
    price: number
    sufficient: boolean
    stock: number
    id: string
}

export function Item({
    id,
    description,
    featured,
    imageUrl,
    name,
    price,
    sufficient,
    stock,
}: ItemProps) {
    const { isWishlisted, toggleWishlist } = useWishlist()
    const wishlist = isWishlisted(id)
    return (
        <Card className="relative w-full max-w-xs gap-0 self-stretch overflow-visible rounded-lg py-0">
            {featured && (
                <div
                    aria-label="Featured item"
                    className="absolute -top-3 -right-3 z-10 grid size-8 place-items-center rounded-full bg-primary-2 text-primary-foreground shadow-sm"
                >
                    <Star aria-hidden="true" className="size-5 fill-current" />
                </div>
            )}

            <div className="relative aspect-[2/1] overflow-hidden rounded-t-[calc(var(--radius-lg)-2px)] bg-card-primary">
                <Image
                    src={imageUrl}
                    alt=""
                    fill
                    sizes="(max-width: 548px) 100vw, 448px"
                    className="object-contain p-4"
                />

                {stock <= 0 && (
                    <Badge
                        variant="secondary"
                        className="text-red-foreground absolute bottom-2 left-2 rounded-full bg-red-500 px-3 py-1 text-sm font-medium"
                    >
                        OUT OF STOCK
                    </Badge>
                )}

                {stock <= 10 && stock > 0 && (
                    <Badge
                        variant="secondary"
                        className="text-red-foreground absolute bottom-2 left-2 rounded-full bg-yellow-500 px-3 py-1 text-sm font-medium"
                    >
                        {stock} left
                    </Badge>
                )}
            </div>
            <div className="flex flex-1 flex-col gap-5 p-4">
                <div className="space-y-2">
                    <h3 className="text-xl leading-tight font-extrabold">
                        {name}
                    </h3>
                    <p className="text-sm leading-relaxed font-medium text-muted-foreground">
                        {description}
                    </p>
                </div>

                <div className="mt-auto flex items-center gap-2">
                    {sufficient && stock > 0 ? (
                        <Button
                            type="button"
                            variant="primary"
                            className="flex-1 h-10 rounded-full border-0 text-base font-bold"
                            asChild
                        >
                            <Link href={`/shop/item/${id}`}>
                                ${price}
                                <span className="sr-only">coins</span>
                            </Link>
                        </Button>
                    ) : (
                        <Button
                            type="button"
                            variant="primary"
                            disabled
                            className="flex-1 h-10 rounded-full border-0 text-base font-bold"
                        >
                            ${price}
                            <span className="sr-only">coins</span>
                        </Button>
                    )}
                    <Button
                        type="button"
                        variant="default"
                        aria-pressed={wishlist}
                        onClick={() => toggleWishlist(id)}
                        className={cn(
                            "h-10 w-10 shrink-0 rounded-full border-2 p-0 font-bold focus-visible:ring-2 focus-visible:ring-current",
                            !wishlist &&
                                "border-white bg-transparent text-white hover:bg-white/10 focus-visible:border-white",
                            wishlist &&
                                "border-white bg-white text-primary hover:bg-white/90 focus-visible:border-white"
                        )}
                    >
                        <Star
                            aria-hidden="true"
                            className="size-5 fill-current"
                        />
                    </Button>
                </div>
            </div>
        </Card>
    )
}

export type { ItemProps }
