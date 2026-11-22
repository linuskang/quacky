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
import Link from "next/link"
import { Admin, BotBadge, VerifiedBadge } from "@/components/icons"
import { toast } from "sonner"
import { trpc } from "@/lib/trpc"

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
    const utils = trpc.useUtils()
    const followMutation = trpc.users.follow.useMutation({
        onSuccess: async () => {
            setFollowing(true)
            toast.success(`You followed ${user.username}`)
            await Promise.all([
                utils.users.byHandle.invalidate({ handle: user.username }),
                utils.posts.feed.invalidate(),
            ])
        },
        onError: () => {
            toast.error("Something went wrong")
        },
    })

    const pending = followMutation.isPending

    function followUser() {
        followMutation.mutate({ handle: user.username })
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
                        {user.verified && (
                            <VerifiedBadge />
                        )}
                        {user.role?.toLowerCase() === "admin" && <Admin />}
                        {user.role?.toLowerCase() === "bot" && <BotBadge />}
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
    const { data: users = [] } = trpc.users.suggested.useQuery()

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
