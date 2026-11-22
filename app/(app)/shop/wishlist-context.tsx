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

import { createContext, useContext, useCallback, useMemo } from "react"
import { trpc } from "@/lib/trpc"

type WishlistItem = {
    id: string
    userId: string
    itemId: string
    item: {
        id: string
        name: string
        imageUrl: string
        price: number
    }
}

type WishlistContextType = {
    items: WishlistItem[]
    points: number
    isWishlisted: (itemId: string) => boolean
    toggleWishlist: (itemId: string) => Promise<void>
    loading: boolean
}

const WishlistContext = createContext<WishlistContextType | null>(null)

export function WishlistProvider({ children }: { children: React.ReactNode }) {
    const utils = trpc.useUtils()
    const { data, isLoading: loading } = trpc.shop.wishlistList.useQuery()
    const addMutation = trpc.shop.wishlistAdd.useMutation()
    const removeMutation = trpc.shop.wishlistRemove.useMutation()

    const items: WishlistItem[] = useMemo(
        () => data?.items ?? [],
        [data?.items]
    )
    const points = data?.points ?? 0

    const isWishlisted = useCallback(
        (itemId: string) => items.some((entry) => entry.itemId === itemId),
        [items]
    )

    const toggleWishlist = useCallback(
        async (itemId: string) => {
            const currentlyWishlisted = items.some(
                (entry) => entry.itemId === itemId
            )

            if (currentlyWishlisted) {
                await removeMutation.mutateAsync({ itemId })
            } else {
                await addMutation.mutateAsync({ itemId })
            }

            await utils.shop.wishlistList.invalidate()
        },
        [items, addMutation, removeMutation, utils]
    )

    return (
        <WishlistContext.Provider
            value={{ items, points, isWishlisted, toggleWishlist, loading }}
        >
            {children}
        </WishlistContext.Provider>
    )
}

export function useWishlist() {
    const context = useContext(WishlistContext)
    if (!context) {
        throw new Error("useWishlist must be used within a WishlistProvider")
    }
    return context
}
