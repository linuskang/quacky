"use client"

import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
} from "react"
import axios from "axios"

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
    const [items, setItems] = useState<WishlistItem[]>([])
    const [points, setPoints] = useState(0)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        axios
            .get("/api/shop/wishlist")
            .then((res) => {
                const data = res.data.data
                if (data && Array.isArray(data.items)) {
                    setItems(data.items)
                    setPoints(data.points ?? 0)
                } else {
                    setItems(data ?? [])
                }
            })
            .catch(() => {
                setItems([])
                setPoints(0)
            })
            .finally(() => setLoading(false))
    }, [])

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
                await axios.delete("/api/shop/wishlist", {
                    data: { itemId },
                })
                setItems((prev) =>
                    prev.filter((entry) => entry.itemId !== itemId)
                )
            } else {
                const res = await axios.post("/api/shop/wishlist", { itemId })
                setItems((prev) => [...prev, res.data.data])
            }
        },
        [items]
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
