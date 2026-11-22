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
import Link from "next/link"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Admin, BotBadge, VerifiedBadge } from "@/components/icons"
import { toast } from "sonner"
import type { User } from "@/types"
import { Button } from "@/components/ui/button"
import { playfairDisplay } from "@/lib/fonts"
import { trpc } from "@/lib/trpc"

type DialogType = "following" | "followers" | null

type ApiResponse = {
    users: User[]
}

export function FollowCounts({
    handle,
    followingCount,
    followersCount,
}: {
    handle: string
    followingCount: number
    followersCount: number
}) {
    const [open, setOpen] = useState<DialogType>(null)
    const [search, setSearch] = useState("")
    const trimmedSearch = search.trim() || undefined

    const followersQuery = trpc.users.followers.useQuery(
        { handle, search: trimmedSearch },
        { enabled: open === "followers" }
    )
    const followingQuery = trpc.users.following.useQuery(
        { handle, search: trimmedSearch },
        { enabled: open === "following" }
    )

    const activeQuery =
        open === "following" ? followingQuery : followersQuery
    const data: ApiResponse | null = activeQuery.data ?? null
    const loading = activeQuery.isLoading

    useEffect(() => {
        if (activeQuery.error) {
            toast.error(activeQuery.error.message || "something happened")
        }
    }, [activeQuery.error])

    const openDialog = (type: DialogType) => {
        setOpen(type)
        setSearch("")
    }

    const closeDialog = () => {
        setOpen(null)
    }

    const handleSearchChange = (value: string) => {
        setSearch(value)
    }

    const refetchActive = () => {
        if (open === "following") {
            void followingQuery.refetch()
        } else if (open === "followers") {
            void followersQuery.refetch()
        }
    }

    return (
        <>
            <p className="mt-0.5 text-sm text-muted-foreground">
                <button
                    onClick={() => openDialog("following")}
                    className="hover:underline"
                >
                    <span className="font-bold text-primary">
                        {followingCount}
                    </span>{" "}
                    Following
                </button>
                <span className="mx-1.5">·</span>
                <button
                    onClick={() => openDialog("followers")}
                    className="hover:underline"
                >
                    <span className="font-bold text-primary">
                        {followersCount}
                    </span>{" "}
                    Followers
                </button>
            </p>

            <FollowDialog
                type={open}
                search={search}
                data={data}
                loading={loading}
                onClose={closeDialog}
                onSearchChange={handleSearchChange}
                onSearchSubmit={refetchActive}
            />
        </>
    )
}

function FollowDialog({
    type,
    search,
    data,
    loading,
    onClose,
    onSearchChange,
    onSearchSubmit,
}: {
    type: DialogType
    search: string
    data: ApiResponse | null
    loading: boolean
    onClose: () => void
    onSearchChange: (value: string) => void
    onSearchSubmit: () => void
}) {
    const isOpen = type !== null
    const title = type === "following" ? "Following" : "Followers"

    return (
        <Dialog open={isOpen} onOpenChange={(v) => !v && onClose()}>
            <DialogContent
                className="flex max-h-[80vh] w-full !max-w-md flex-col gap-3 overflow-hidden border-2 border-border bg-card-primary p-4"
                showCloseButton={false}
            >
                <DialogHeader>
                    <DialogTitle
                        className={`text-4xl font-semibold ${playfairDisplay.className} text-primary`}
                        style={{ fontStyle: "italic" }}
                    >
                        {title}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex items-center gap-2">
                    <Input
                        placeholder="Search users..."
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && onSearchSubmit()}
                        className="h-8 flex-1 border-2 border-border !bg-card !ring-0 focus:!border-chart-3"
                    />
                </div>

                <div className="max-h-[400px] min-h-[200px] overflow-y-auto">
                    {loading && !data ? (
                        <p className="py-8 text-center text-sm text-muted-foreground">
                            Loading...
                        </p>
                    ) : data?.users.length === 0 ? (
                        <p className="py-8 text-center text-sm text-muted-foreground">
                            Nobody is here {":("}
                        </p>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {data?.users.map((user) => (
                                <Link
                                    key={user.username}
                                    href={`/@${user.username}`}
                                    onClick={onClose}
                                    className="flex items-center gap-3 rounded-md border-2 border-border bg-card-primary p-2 transition hover:border-primary/80"
                                >
                                    <Image
                                        src={user.image}
                                        alt={user.name}
                                        width={40}
                                        height={40}
                                        unoptimized
                                        className="h-10 w-10 shrink-0 rounded-full object-cover"
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
                                        <p className="text-sm font-medium text-muted-foreground">
                                            @{user.username}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                <DialogClose asChild>
                    <Button
                        variant="default"
                        className="h-10 w-full border-2 border-border bg-background text-lg text-primary hover:!border-primary hover:bg-background"
                    >
                        Close
                    </Button>
                </DialogClose>
            </DialogContent>
        </Dialog>
    )
}
