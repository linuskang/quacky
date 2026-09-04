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
import { Bell, Home, MessagesSquare, PenSquare, Search, User, Settings, LogOut } from "lucide-react"
import { authClient } from "@/client/auth"
import Image from "next/image"

// Hooks
import { useUnreads } from "@/hooks/use-unreads"

export function MobileNav({ handle }: { handle: string }) {
    const pathname = usePathname()
    const { notifications, dms } = useUnreads()
    const { data: session, isPending } = authClient.useSession()

    if (!session || isPending) {
        return null
    }

    const items = [
        {
            href: "/",
            img: "/logo2.png"
        },
        {
            href: "/search",
            img: "/goose/laptop.png"
        },
        {
            href: "/dms",
            img: "/goose/V Formation 5.png"
        },
        {
            href: "/notifications",
            img: "/goose/Ping Pong Table Tennis.png"
        },
        {
            href: "/fuzzies",
            img: "/goose/Hug.png"
        },
        {
            href: "/quiz",
            img: "/goose/Academic Scroll.png"
        },
        {
            href: "/shop",
            img: "/goose/Aquafest Whale 2.png"
        },
        {
            href: `/@${handle}`,
            img: session.user.image
        }
    ]

    return (
        <nav className="sticky bottom-0 z-50 bg-background border-t border-border lg:hidden">
            <div className="mx-auto grid max-w-xl grid-cols-10 items-center">
                {items.map(({ href, img }) => {
                    const active = pathname === href

                    return (
                        <Link
                            key={href}
                            href={href}
                            className="flex flex-col items-center gap-1 py-2.5"
                        >
                            <span className="flex h-8 items-center justify-center">

                                <span className="relative">
                                    <Image
                                        src={img!}
                                        alt="whatever this is"
                                        width={active ? 40 : 38}
                                        height={active ? 40 : 36}
                                        className="rounded-full"
                                        style={{ width: "auto" }}
                                    />
                                </span>
                            </span>
                        </Link>
                    )
                })}

                <div className="col-span-2 flex items-center justify-center rounded-lg gap-1 bg-card py-1.5">
                    <Link
                        href={`/@${handle}`}
                        aria-label="Settings"
                        className="flex h-7 w-7 items-center justify-center text-primary"
                    >
                        <Settings className="h-4 w-4" strokeWidth={3} />
                    </Link>
                    <button
                        type="button"
                        aria-label="Log out"
                        className="flex h-7 w-7 items-center justify-center text-primary"
                        onClick={async () => {
                            await authClient.signOut()
                            window.location.reload()
                        }}
                    >
                        <LogOut className="h-4 w-4" strokeWidth={3} />
                    </button>
                </div>
            </div>
        </nav>
    )
}
