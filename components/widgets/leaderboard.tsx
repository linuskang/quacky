"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"

import {
    Widget,
    WidgetContent,
    WidgetSecondaryHeader,
} from "@/components/widgets/widget"

type LeaderboardUser = {
    username: string
    name: string
    image: string
    points: number
}

export function LeaderboardWidget() {
    const [users, setUsers] = useState<LeaderboardUser[]>([])

    useEffect(() => {
        fetch("/api/leaderboard")
            .then(async (response) => {
                if (!response.ok) return
                const data = (await response.json()) as {
                    users: LeaderboardUser[]
                }
                setUsers(data.users)
            })
            .catch(() => undefined)
    }, [])

    return (
        <Widget>
            <WidgetSecondaryHeader>
                <h2 className="text-lg font-bold text-primary">
                    Money Leaderboard
                </h2>
            </WidgetSecondaryHeader>
            <WidgetContent>
                {users.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        No leaderboard data yet.
                    </p>
                ) : (
                    <div className="flex flex-col gap-2">
                        {users.map((user, index) => (
                            <Link
                                key={user.username}
                                href={`/@${user.username}`}
                                className="flex min-w-0 items-center gap-2 rounded-md p-1 transition-colors hover:bg-background"
                            >
                                <span className="w-5 shrink-0 text-sm font-bold text-muted-foreground">
                                    {index + 1}
                                </span>
                                <Image
                                    src={user.image || "/default-avatar.png"}
                                    alt={user.name}
                                    width={28}
                                    height={28}
                                    unoptimized
                                    className="size-7 shrink-0 rounded-full object-cover"
                                />
                                <span className="min-w-0 flex-1 truncate text-sm font-semibold text-primary">
                                    {user.name}
                                </span>
                                <span className="shrink-0 text-sm font-bold text-primary-2">
                                    {user.points.toLocaleString()}$
                                </span>
                            </Link>
                        ))}
                    </div>
                )}
            </WidgetContent>
        </Widget>
    )
}
