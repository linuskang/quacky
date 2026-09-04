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

import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"
import { Item, type ItemProps } from "./item"

type ItemData = ItemProps & {
    id: string
}

type ItemListProps = Omit<ComponentProps<"div">, "children"> & {
    items: ItemData[]
    variant?: "horizontal" | "grid"
}

export function ItemList({
    className,
    items,
    variant = "horizontal",
    ...props
}: ItemListProps) {
    if (variant === "grid") {
        return (
            <div
                className={cn(
                    "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 [&>[data-slot=card]]:w-full [&>[data-slot=card]]:max-w-none",
                    className
                )}
                {...props}
            >
                {items.map((item) => (
                    <Item key={item.id} {...item} />
                ))}
            </div>
        )
    }

    return (
        <div
            className={cn(
                "relative -mx-3 w-[calc(100vw-(100vw-100%)/2+0.75rem)] lg:w-[calc(100%+1.75rem)]",
                className
            )}
            {...props}
        >
            <div className="flex items-stretch gap-5 overflow-x-auto px-3 pt-3 pb-4 [&>[data-slot=card]]:shrink-0">
                {items.map((item) => (
                    <Item key={item.id} {...item} />
                ))}
            </div>
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 right-0 z-20 w-16 bg-linear-to-l from-background to-transparent"
            />
        </div>
    )
}

export type { ItemData, ItemListProps }
