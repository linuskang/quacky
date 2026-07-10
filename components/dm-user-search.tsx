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

import { useEffect, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { BadgeCheck } from "lucide-react"
import { Admin } from "@/components/icons"
import { SearchBar } from "@/components/search-bar"
import type { User } from "@/types"

type SearchUser = Omit<User, "role"> & {
    role: string | null
}

export function DmUserSearch() {
    const router = useRouter()
    const [query, setQuery] = useState("")
    const [users, setUsers] = useState<SearchUser[]>([])

    useEffect(() => {
        const trimmedQuery = query.trim()

        if (!trimmedQuery) {
            return
        }

        const controller = new AbortController()

        void fetch(`/api/users/mentions?q=${encodeURIComponent(trimmedQuery)}`, {
            signal: controller.signal,
        })
            .then(async (res) => {
                if (!res.ok) return []

                const data = (await res.json()) as { users?: SearchUser[] }
                return data.users ?? []
            })
            .then(setUsers)
            .catch((error) => {
                if (
                    error instanceof DOMException &&
                    error.name === "AbortError"
                ) {
                    return
                }

                setUsers([])
            })

        return () => controller.abort()
    }, [query])

    const visibleUsers = query.trim() ? users : []

    return (
        <div className="relative w-full">
            <SearchBar
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search people to message..."
            />

            {visibleUsers.length > 0 && (
                <div className="absolute top-full left-0 z-50 mt-2 w-full overflow-hidden rounded-md border-2 border-border bg-background shadow-sm">
                    {visibleUsers.map((user) => (
                        <button
                            key={user.username}
                            type="button"
                            onMouseDown={() => router.push(`/dms/${user.username}`)}
                            className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-primary/10"
                        >
                            <Image
                                src={user.image}
                                alt={user.name}
                                width={32}
                                height={32}
                                unoptimized
                                className="h-8 w-8 shrink-0 rounded-full object-cover"
                            />

                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1">
                                    <span className="truncate text-sm font-semibold text-primary">
                                        {user.name}
                                    </span>
                                    {user.verified && (
                                        <BadgeCheck className="h-4 w-4 shrink-0 fill-primary text-background" />
                                    )}
                                    {user.role === "admin" && <Admin />}
                                </div>
                                <p className="truncate text-xs font-medium text-muted-foreground">
                                    @{user.username}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
