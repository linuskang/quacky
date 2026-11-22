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

// Libraries
import { toast } from "sonner"
import { authClient } from "@/client/auth"
import { useState } from "react"
import { trpc } from "@/lib/trpc"

// Components
import { Widget, WidgetContent, WidgetSecondaryHeader } from "./widget"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Types
import { User } from "@/types"
import { Title } from "../text"

export default function RelevantPeople({ users }: { users: User[] }) {
    const { data: session } = authClient.useSession()
    const [followedUsers, setFollowedUsers] = useState<string[]>([])
    const [pendingUsers, setPendingUsers] = useState<string[]>([])
    const utils = trpc.useUtils()
    const followMutation = trpc.users.follow.useMutation()

    if (!session) return null

    if (users.length === 0) return null

    async function follow(handle: string) {
        setPendingUsers((users) => [...users, handle])

        try {
            await followMutation.mutateAsync({ handle })
            setFollowedUsers((users) => [...users, handle])
            toast.success("Followed user")
            await Promise.all([
                utils.users.byHandle.invalidate({ handle }),
                utils.users.suggested.invalidate(),
                utils.posts.feed.invalidate(),
            ])
        } catch {
            toast.error("Something went wrong")
        } finally {
            setPendingUsers((users) => users.filter((user) => user !== handle))
        }
    }

    return (
        <Widget>
            <WidgetSecondaryHeader>
                <Title>relevant people</Title>
            </WidgetSecondaryHeader>
            <WidgetContent>
                <p className="text-sm text-muted-foreground">
                    people you may want to follow.
                </p>
                <div className="mt-3 space-y-3">
                    {users.map((user) => {
                        const isMe = user.username === session.user.username
                        const isFollowing =
                            user.following ||
                            followedUsers.includes(user.username)
                        const isPending = pendingUsers.includes(user.username)

                        return (
                            <div
                                key={user.username}
                                className="flex items-center justify-between"
                            >
                                <div className="flex items-center space-x-3">
                                    <Avatar size="lg">
                                        {user.image && (
                                            <AvatarImage
                                                src={user.image}
                                                alt={user.name}
                                            />
                                        )}
                                        <AvatarFallback>
                                            {user.name.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <span className="font-semibold">
                                            {user.name}
                                        </span>
                                        <span className="text-sm text-muted-foreground">
                                            @{user.username}
                                        </span>
                                    </div>
                                </div>
                                <Button
                                    variant="primary"
                                    size="lg"
                                    className="rounded-full text-sm"
                                    disabled={isMe || isFollowing || isPending}
                                    onClick={() => follow(user.username)}
                                >
                                    {isMe
                                        ? "You"
                                        : isPending
                                          ? "Following..."
                                          : isFollowing
                                            ? "Following"
                                            : "Follow"}
                                </Button>
                            </div>
                        )
                    })}
                </div>
            </WidgetContent>
        </Widget>
    )
}
