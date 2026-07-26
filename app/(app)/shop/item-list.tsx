import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"
import { Item, type ItemProps } from "./item"

type ItemData = ItemProps & {
    id: string
}

type ItemListProps = Omit<ComponentProps<"div">, "children"> & {
    items: ItemData[]
}

export function ItemList({ className, items, ...props }: ItemListProps) {
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
