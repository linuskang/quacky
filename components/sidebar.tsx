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

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { exo2, playfairDisplay } from "@/app/layout"
import { useEffect, useState } from "react"

import {
    Home,
    Search,
    Bell,
    User,
    MessagesSquare,
    Briefcase,
    Bookmark,
    TrendingUp,
    MessageCircleCheck,
    Shield,
    BookCheck,
    GraduationCap,
    RollerCoaster,
    FerrisWheel,
    Store,
    BadgeQuestionMark,
} from "lucide-react"
import Image from "next/image"

import { Button } from "@/components/ui/button"

interface Props {
    session: {
        user: {
            handle: string
            image: string
            role: string
        }
    }
}

type Unreads = {
    notifications: number
    dms: number
    fuzzies: number
}

type MeResponse = {
    unreads?: Partial<Unreads>
}

function UnreadBadge({ count }: { count?: number }) {
    if (!count) return null

    return (
        <span className="ml-auto rounded-full bg-primary-2 px-2 py-0.5 text-xs font-bold leading-none text-background">
            {count > 99 ? "99+" : count}
        </span>
    )
}

export function Sidebar({ session }: Props) {
    const pathname = usePathname()
    const [unreads, setUnreads] = useState<Unreads>({
        notifications: 0,
        dms: 0,
        fuzzies: 0,
    })

    useEffect(() => {
        const controller = new AbortController()

        void fetch("/api/me", { signal: controller.signal })
            .then(async (res) => {
                if (!res.ok) return null
                return (await res.json()) as MeResponse
            })
            .then((data) => {
                if (!data?.unreads) return

                setUnreads({
                    notifications: data.unreads.notifications ?? 0,
                    dms: data.unreads.dms ?? 0,
                    fuzzies: data.unreads.fuzzies ?? 0,
                })
            })
            .catch((error) => {
                if (
                    error instanceof DOMException &&
                    error.name === "AbortError"
                ) {
                    return
                }
            })

        return () => controller.abort()
    }, [pathname])

    const items = [
        { href: "/", label: "home", icon: Home },
        { href: "/search", label: "search", icon: Search },
        { href: "/dms", label: "dms", icon: MessagesSquare, unread: unreads.dms },
        {
            href: "/fuzzies",
            label: "warm fuzzies",
            icon: Briefcase,
            unread: unreads.fuzzies,
        },
        { href: "/trending", label: "trending", icon: TrendingUp },
        {
            href: "/check-in",
            label: "daily check in",
            icon: MessageCircleCheck,
        },
        { href: "/memes", label: "memeland", icon: RollerCoaster },
        { href: "/quiz", label: "quizzes", icon: BookCheck },
        { href: "/bookmarks", label: "bookmarks", icon: Bookmark },
        { href: "/shop", label: "shop", icon: Store },
        { href: "/resources", label: "resources", icon: GraduationCap },
        { href: "/missions", label: "missions", icon: BadgeQuestionMark },
        {
            href: "/notifications",
            label: "notifications",
            icon: Bell,
            unread: unreads.notifications,
        },
        { href: `/@${session.user.handle}`, label: "profile", icon: User },

    ]

    if (session.user.role == "admin") {
        items.push({ href: "/admin", label: "admin panel", icon: Shield })
    }

    return (
        <div className={`flex h-full flex-col ${exo2.className}`}>
            <Link href="/">
                <Image
                    className="mx-auto mt-4 h-auto"
                    src="/quacky.png"
                    alt="Quacky logo"
                    width={200}
                    height={200}
                />
            </Link>

            <nav className="flex flex-1 flex-col justify-center gap-1 px-2">
                {items.map(({ href, label, icon: Icon, unread }) => {
                    const active = pathname === href

                    return (
                        <Link
                            key={href}
                            href={href}
                            className={cn(
                                "flex items-center gap-3 rounded-full py-2 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]",
                                active
                                    ? `translate-x-2 text-2xl font-bold ${playfairDisplay.className} text-primary`
                                    : "translate-x-0 text-xl font-semibold text-primary/80 hover:translate-x-1 hover:text-primary"
                            )}
                        >
                            <Icon
                                className={cn(
                                    "shrink-0 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]",
                                    active ? "size-9" : "size-7"
                                )}
                                strokeWidth={active ? 2.5 : 2}
                            />
                            <span className="truncate">{label}</span>
                            <UnreadBadge count={unread} />
                        </Link>
                    )
                })}

                <Button
                    asChild
                    className="mt-4 h-11 w-full rounded-full bg-primary-2 text-base font-semibold text-background hover:bg-primary-2/80"
                >
                    <Link href="/post">Post</Link>
                </Button>
            </nav>
        </div>
    )
}
