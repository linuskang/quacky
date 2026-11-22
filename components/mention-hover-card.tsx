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
import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { trpc } from "@/lib/trpc"

// Components
import { Admin, BotBadge, VerifiedBadge } from "@/components/icons"
import { Button } from "@/components/ui/button"
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card"
import Loading from "./loading"

export function MentionHoverCard({ username }: { username: string }) {
    const [open, setOpen] = useState(false)

    const { data: currentProfile, isError } = trpc.users.byHandle.useQuery(
        { handle: username },
        { enabled: open }
    )
    const currentError = isError ? "User not found" : null

    return (
        <HoverCard
            open={open}
            onOpenChange={setOpen}
            openDelay={150}
            closeDelay={100}
        >
            <HoverCardTrigger asChild>
                <span className="cursor-pointer font-medium [overflow-wrap:anywhere] break-words text-primary-2 underline-offset-2 hover:underline">
                    @{username}
                </span>
            </HoverCardTrigger>
            <HoverCardContent
                align="start"
                className="w-72 border-2 border-border bg-background p-3"
                onClick={(event) => event.stopPropagation()}
            >
                {currentProfile ? (
                    <div className="flex flex-col gap-3">
                        <div className="flex items-start gap-3">
                            <Image
                                src={
                                    ("image" in currentProfile && currentProfile.image) ||
                                    "/default-avatar.png"
                                }
                                alt={currentProfile.name}
                                width={44}
                                height={44}
                                unoptimized
                                className="h-11 w-11 rounded-full object-cover"
                            />
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1">
                                    <span className="truncate text-sm font-semibold text-primary">
                                        {currentProfile.name}
                                    </span>
                                    {"verified" in currentProfile && currentProfile.verified && (
                                        <VerifiedBadge />
                                    )}
                                    {"role" in currentProfile && currentProfile.role?.toLowerCase() === "admin" && <Admin />}
                                    {"role" in currentProfile && currentProfile.role?.toLowerCase() === "bot" && <BotBadge />}
                                </div>
                                <div className="truncate text-sm font-medium text-muted-foreground">
                                    @{currentProfile.username}
                                </div>
                            </div>
                        </div>
                        {"bio" in currentProfile && currentProfile.bio && (
                            <p className="line-clamp-3 text-sm text-muted-foreground">
                                {currentProfile.bio}
                            </p>
                        )}
                        <Button
                            asChild
                            size="sm"
                            className="h-8 rounded-full bg-primary-2 text-sm font-semibold hover:bg-primary-2/80"
                        >
                            <Link href={`/@${currentProfile.username}`}>
                                View profile
                            </Link>
                        </Button>
                    </div>
                ) : currentError ? (
                    <p className="text-sm text-muted-foreground">{currentError}</p>
                ) : (
                    <Loading />
                )}
            </HoverCardContent>
        </HoverCard>
    )
}
