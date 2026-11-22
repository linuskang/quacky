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

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Admin, BotBadge, VerifiedBadge } from "@/components/icons"
import { SearchBar } from "@/components/search-bar"
import { trpc } from "@/lib/trpc"

export function DmUserSearch() {
    const router = useRouter()
    const [query, setQuery] = useState("")
    const trimmedQuery = query.trim()

    const { data } = trpc.users.mentions.useQuery(
        { query: trimmedQuery },
        { enabled: Boolean(trimmedQuery) }
    )

    const visibleUsers = trimmedQuery ? (data?.users ?? []) : []

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
                            onMouseDown={() =>
                                router.push(`/dms/${user.username}`)
                            }
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
                                        <VerifiedBadge />
                                    )}
                                    {user.role?.toLowerCase() === "admin" && <Admin />}
                                    {user.role?.toLowerCase() === "bot" && <BotBadge />}
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
