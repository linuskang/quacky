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

import { X } from "lucide-react"

import {
    Widget,
    WidgetSecondaryHeader,
    WidgetContent,
} from "@/components/widgets/widget"
import { useWishlist } from "@/app/(app)/shop/wishlist-context"
import { Card } from "../ui/card"
import { Button } from "../ui/button"
import { Progress } from "../ui/progress"
import Image from "next/image"

export function WishlistWidget() {
    const { items, points, loading, toggleWishlist } = useWishlist()

    return (
        <Widget className="bg-background border-0">
            <WidgetSecondaryHeader className="bg-background">
                <div className="flex items-center">
                    <div className="flex items-center">
                        <h1 className="text-lg font-bold text-primary">wishlist</h1>
                    </div>
                </div>
            </WidgetSecondaryHeader>

            <WidgetContent>
                {loading ? (
                    <p className="text-sm text-muted-foreground">loading...</p>
                ) : items.length > 0 ? (
                    <ul className="space-y-2">
                        {items.map((item) => {
                            const remaining = Math.max(item.item.price - points, 0)
                            const progress = Math.min(
                                (points / item.item.price) * 100,
                                100
                            )

                            return (
                                <Card key={item.id} className="relative overflow-visible p-2">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon-xs"
                                        aria-label="Remove from wishlist"
                                        onClick={() => toggleWishlist(item.itemId)}
                                        className="absolute -top-2 -right-2 z-10 h-6 w-6 rounded-full border border-border hover:!bg-card bg-card text-muted-foreground shadow-sm"
                                    >
                                        <X className="size-3.5" />
                                    </Button>
                                    <div className="flex items-center gap-3">
                                        <Image
                                            src={item.item.imageUrl}
                                            alt={item.item.name}
                                            width={48}
                                            height={48}
                                            className="h-12 w-12 shrink-0 rounded-lg object-cover"
                                        />
                                        <div className="flex min-w-0 flex-1 flex-col gap-1">
                                            <span className="text-sm font-medium text-primary truncate">
                                                {item.item.name}
                                            </span>
                                            <Progress value={progress} />
                                            <p className="text-xs text-muted-foreground">
                                                {remaining === 0
                                                    ? "ready to buy!"
                                                    : `${remaining} coins left`}
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            )
                        })}
                    </ul>
                ) : (
                    <p className="text-sm text-muted-foreground">
                        add some items to your wishlist and start saving!
                    </p>
                )}
            </WidgetContent>
        </Widget>
    )
}
