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

import { useEffect, useState, useTransition } from "react"
import Image from "next/image"
import Link from "next/link"
import { BadgeCheck } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"

type SuggestedUser = {
    id: string
    name: string
    username: string
    image: string
    verified: boolean
    role?: string | null
    bio?: string | null
    followers: number
}

function SuggestedPerson({ user }: { user: SuggestedUser }) {
    const [following, setFollowing] = useState(false)
    const [pending, startTransition] = useTransition()

    function followUser() {
        startTransition(async () => {
            try {
                const res = await fetch(`/api/user/${user.username}/follow`, {
                    method: "POST",
                })

                if (!res.ok) {
                    throw new Error("Failed to follow user")
                }

                setFollowing(true)
                toast.success(`You followed ${user.username}`)
            } catch {
                toast.error("Something went wrong")
            }
        })
    }

    return (
        <div className="flex min-w-0 flex-col gap-3 rounded-3xl border-2 border-border bg-card p-2">
            <Link
                href={`/@${user.username}`}
                className="flex min-w-0 items-center gap-3"
            >
                <Image
                    src={user.image}
                    alt={user.name}
                    width={22}
                    height={22}
                    className="h-8 w-8 shrink-0 rounded-full object-cover"
                />
                <div className="min-w-0">
                    <div className="flex min-w-0 items-center gap-1">
                        <p className="truncate text-sm leading-tight font-bold">
                            {user.name}
                        </p>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                        @{user.username}
                    </p>
                </div>
            </Link>

            <p className="line-clamp-4 min-h-15 text-xs text-muted-foreground">
                {user.bio}
            </p>

            <Button
                size="sm"
                disabled={pending || following}
                onClick={followUser}
                className="h-8 rounded-full bg-primary-2 text-sm font-semibold text-background hover:bg-primary-2/80"
            >
                {pending ? "Following..." : following ? "Following" : "Follow"}
            </Button>
        </div>
    )
}

export function SuggestedPeopleFeedCard() {
    const [users, setUsers] = useState<SuggestedUser[]>([])

    useEffect(() => {
        let cancelled = false

        fetch("/api/users/suggested", { cache: "no-store" })
            .then((res) => (res.ok ? res.json() : []))
            .then((data: SuggestedUser[]) => {
                if (!cancelled) {
                    setUsers(data)
                }
            })
            .catch(() => undefined)

        return () => {
            cancelled = true
        }
    }, [])

    if (users.length === 0) {
        return null
    }

    return (
        <div className="relative">
            <div className="relative mb-2 flex items-center">
                <h1 className="text-2xl font-extrabold text-primary">
                    cool people {"^_~"}
                </h1>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
                {users.map((user) => (
                    <SuggestedPerson key={user.id} user={user} />
                ))}
            </div>
        </div>
    )
}
