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
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell, Home, MessagesSquare, PenSquare, Search, User } from "lucide-react"

// Hooks
import { useUnreads } from "@/hooks/use-unreads"

// Utilities
import { cn } from "@/lib/utils"

export function MobileNav({ handle }: { handle: string }) {
    const pathname = usePathname()
    const { notifications, dms } = useUnreads()

    const items = [
        { href: "/", label: "Home", icon: Home, primary: false },
        { href: "/search", label: "Search", icon: Search, primary: false },
        { href: "/post", label: "Post", icon: PenSquare, primary: true },
        { href: "/dms", label: "DMs", icon: MessagesSquare, primary: false, unread: dms },
        { href: "/notifications", label: "Alerts", icon: Bell, primary: false, unread: notifications },
        { href: `/@${handle}`, label: "Me", icon: User, primary: false },
    ]

    return (
        <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border/60 bg-background/90 pb-[env(safe-area-inset-bottom)] backdrop-blur supports-[backdrop-filter]:bg-background/75 lg:hidden">
            <div className="mx-auto grid max-w-xl grid-cols-6">
                {items.map(({ href, label, icon: Icon, primary, unread }) => {
                    const active = pathname === href

                    return (
                        <Link
                            key={href}
                            href={href}
                            className="flex flex-col items-center gap-1 py-2.5"
                        >
                            <span className="flex h-8 items-center justify-center">
                                {primary ? (
                                    <span className="flex size-8 items-center justify-center rounded-full bg-primary-2 text-background">
                                        <Icon className="size-4" strokeWidth={2.5} />
                                    </span>
                                ) : (
                                    <span className="relative">
                                        <Icon
                                            className={cn(
                                                "size-6",
                                                active ? "text-primary" : "text-primary/80"
                                            )}
                                            strokeWidth={active ? 2.5 : 2}
                                        />
                                        {!!unread && (
                                            <span className="absolute -top-1 -right-1.5 rounded-full bg-primary-2 px-1 py-0.5 text-[10px] leading-none font-bold text-background">
                                                {unread > 99 ? "99+" : unread}
                                            </span>
                                        )}
                                    </span>
                                )}
                            </span>
                            <span
                                className={cn(
                                    "text-[10px] leading-none",
                                    active ? "font-bold text-primary" : "text-primary/80"
                                )}
                            >
                                {label}
                            </span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
