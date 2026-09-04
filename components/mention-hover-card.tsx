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
import axios from "axios"
import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"

// Components
import { BadgeCheck } from "lucide-react"
import { Admin } from "@/components/icons"
import { Button } from "@/components/ui/button"
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card"
import Loading from "./loading"

// Types
type MentionProfile = {
    name: string
    username: string
    image?: string
    verified?: boolean
    role?: string | null
    bio?: string | null
    banned?: boolean | null
}

export function MentionHoverCard({ username }: { username: string }) {
    const [open, setOpen] = useState(false)
    const [profile, setProfile] = useState<MentionProfile | null>(null)
    const [loadedUsername, setLoadedUsername] = useState<string | null>(null)
    const [error, setError] = useState<{
        username: string
        message: string
    } | null>(null)

    useEffect(() => {
        if (!open || loadedUsername === username) return

        const controller = new AbortController()

        async function fetchProfile() {
            await axios
                .get(`/api/user/${username}`, {
                    signal: controller.signal,
                })
                .then((res) => {
                    setProfile(res.data as MentionProfile)
                    setLoadedUsername(username)
                })
        }

        fetchProfile().catch((error) => {
            if (
                controller.signal.aborted ||
                (axios.isCancel(error) && error?.code === "ERR_CANCELED")
            )
                return

            setError({ username, message: "User not found" })
        })

        return () => controller.abort()
    }, [loadedUsername, open, username])

    const currentProfile = loadedUsername === username ? profile : null
    const currentError = error?.username === username ? error.message : null

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
                                    currentProfile.image ??
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
                                    {currentProfile.verified && (
                                        <BadgeCheck className="h-4 w-4 shrink-0 fill-primary text-background" />
                                    )}
                                    {currentProfile.role === "admin" && <Admin />}
                                </div>
                                <div className="truncate text-sm font-medium text-muted-foreground">
                                    @{currentProfile.username}
                                </div>
                            </div>
                        </div>
                        {currentProfile.bio && (
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
