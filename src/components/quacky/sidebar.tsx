// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://linuskang.au/quacky

"use client";

// Libraries
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

// UI Components
import {
    Home,
    Search,
    Bell,
    User,
    Plus,
    ShieldCheck,
    MessagesSquare,
    Clapperboard,
    Settings,
    Briefcase,
    Bookmark,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Account from "@/components/quacky/account";

// Types
interface Props {
    session: {
        user: {
            name: string;
            handle: string;
            image?: string | null;
            role: string;
        }
    }
}

export default function Sidebar({ session }: Props) {
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        fetch("/api/v1/notifications/count")
            .then((r) => r.json())
            .then((d) => setUnreadCount(d.count ?? 0))
            .catch(() => { });
    }, []);

    const pathname = usePathname();

    const matchPath = (href: string) => {
        if (!pathname) return false;
        if (href === "/") return pathname === "/";
        return pathname === href || pathname.startsWith(href + "/");
    };

    const isHome = matchPath("/");
    const isSearch = matchPath("/search");
    const isMessages = matchPath("/messages");
    const isFuzzies = matchPath("/fuzzies");
    const isShorts = matchPath("/shorts");
    const isNotifications = matchPath("/notifications");
    const isBookmarks = matchPath("/bookmarks");
    const isProfile = matchPath(`/${session.user.handle}`);
    const isSettings = matchPath("/settings");
    const isAdmin = matchPath("/admin");
    const isPost = matchPath("/post");

    return (
        <>
            <aside className="sticky top-0 z-50 w-60 shrink-0 hidden lg:flex flex-col gap-4 pt-8 lg:h-screen">
                <div className="p-0 text-center mb-1.5">
                    <h1 className="text-6xl font-extrabold tracking-tight text-primary dark:text-primary-dark">Quacky</h1>
                </div>
                <div className="rounded-lg p-2 flex flex-col bg-[var(--lynt)] border border-border">
                    <Button
                        asChild
                        variant="ghost"
                        className={cn(
                            "justify-start gap-3 px-4 py-6 rounded-lg bg-transparent hover:bg-white/10 text-base font-bold text-primary cursor-pointer",
                            isHome && "bg-white/10"
                        )}
                    >
                        <Link href="/" aria-current={isHome ? "page" : undefined}>
                            <Home size={28} strokeWidth={3} />
                            <span>Home</span>
                        </Link>
                    </Button>

                    <Button
                        asChild
                        variant="ghost"
                        className={cn(
                            "justify-start gap-3 px-4 py-6 rounded-lg bg-transparent hover:bg-white/10 text-base font-bold text-primary cursor-pointer",
                            isSearch && "bg-white/10"
                        )}
                    >
                        <Link href="/search" aria-current={isSearch ? "page" : undefined}>
                            <Search size={28} strokeWidth={3} />
                            <span>Search</span>
                        </Link>
                    </Button>

                    <Button
                        asChild
                        variant="ghost"
                        className={cn(
                            "justify-start gap-3 px-4 py-6 rounded-lg bg-transparent hover:bg-white/10 text-base font-bold text-primary cursor-pointer",
                            isMessages && "bg-white/10"
                        )}
                    >
                        <Link href="/messages" aria-current={isMessages ? "page" : undefined}>
                            <MessagesSquare size={28} strokeWidth={3} />
                            <span>Messages</span>
                        </Link>
                    </Button>

                    <Button
                        asChild
                        variant="ghost"
                        className={cn(
                            "justify-start gap-3 px-4 py-6 rounded-lg bg-transparent hover:bg-white/10 text-base font-bold text-primary cursor-pointer",
                            isFuzzies && "bg-white/10"
                        )}
                    >
                        <Link href={`/fuzzies`} aria-current={isFuzzies ? "page" : undefined}>
                            <Briefcase size={28} strokeWidth={3} />
                            <span>Warm Fuzzies</span>
                        </Link>
                    </Button>

                    <Button
                        asChild
                        variant="ghost"
                        className={cn(
                            "justify-start gap-3 px-4 py-6 rounded-lg bg-transparent hover:bg-white/10 text-base font-bold text-primary cursor-pointer",
                            isShorts && "bg-white/10"
                        )}
                    >
                        <Link href="/shorts" aria-current={isShorts ? "page" : undefined}>
                            <Clapperboard size={28} strokeWidth={3} />
                            <span>Shorts</span>
                        </Link>
                    </Button>

                    <Button
                        asChild
                        variant="ghost"
                        className={cn(
                            "justify-start gap-3 px-4 py-6 rounded-lg bg-transparent hover:bg-white/10 text-base font-bold text-primary cursor-pointer",
                            isNotifications && "bg-white/10"
                        )}
                    >
                        <Link href="/notifications" aria-current={isNotifications ? "page" : undefined} className="relative">
                            <Bell size={28} strokeWidth={3} />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white px-0.5">
                                    {unreadCount > 99 ? "99+" : unreadCount}
                                </span>
                            )}
                            <span>Notifications</span>
                        </Link>
                    </Button>

                    <Button
                        asChild
                        variant="ghost"
                        className={cn(
                            "justify-start gap-3 px-4 py-6 rounded-lg bg-transparent hover:bg-white/10 text-base font-bold text-primary cursor-pointer",
                            isBookmarks && "bg-white/10"
                        )}
                    >
                        <Link href="/bookmarks" aria-current={isBookmarks ? "page" : undefined}>
                            <Bookmark size={28} strokeWidth={3} />
                            <span>Bookmarks</span>
                        </Link>
                    </Button>

                    <Button
                        asChild
                        variant="ghost"
                        className={cn(
                            "justify-start gap-3 px-4 py-6 rounded-lg bg-transparent hover:bg-white/10 text-base font-bold text-primary cursor-pointer",
                            isProfile && "bg-white/10"
                        )}
                    >
                        <Link href={`/${session.user.handle}`} aria-current={isProfile ? "page" : undefined}>
                            <User size={28} strokeWidth={3} />
                            <span>Profile</span>
                        </Link>
                    </Button>

                    <Button
                        asChild
                        variant="ghost"
                        className={cn(
                            "justify-start gap-3 px-4 py-6 rounded-lg bg-transparent hover:bg-white/10 text-base font-bold text-primary cursor-pointer",
                            isSettings && "bg-white/10"
                        )}
                    >
                        <Link href={`/settings`} aria-current={isSettings ? "page" : undefined}>
                            <Settings size={28} strokeWidth={3} />
                            <span>Settings</span>
                        </Link>
                    </Button>

                    {session.user.role == "Admin" && (
                        <Button
                            asChild
                            variant="ghost"
                            className={cn(
                                "justify-start gap-3 px-4 py-6 rounded-lg bg-transparent hover:bg-white/10 text-base font-bold text-primary cursor-pointer",
                                isAdmin && "bg-white/10"
                            )}
                        >
                            <Link href="/admin" aria-current={isAdmin ? "page" : undefined}>
                                <ShieldCheck size={28} strokeWidth={3} />
                                <span>Admin Portal</span>
                            </Link>
                        </Button>
                    )}
                </div>

                <Button
                    asChild
                    className={cn(
                        "justify-center px-4 py-6 rounded-lg bg-primary hover:bg-primary/90 text-base font-bold text-background w-full cursor-pointer",
                        isPost && "ring-2 ring-white/20"
                    )}
                >
                    <Link href="/post" aria-current={isPost ? "page" : undefined}>
                        <span>Post</span>
                    </Link>
                </Button>

                <div className="mt-auto mb-8">
                    <Account
                        username={session.user.handle}
                        displayName={session.user.name}
                        avatarUrl={session.user.image || ""}
                    />
                </div>
            </aside>

            <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--lynt)] border-t border-border p-2 lg:hidden">
                <div className="max-w-[1200px] mx-auto px-4 grid grid-cols-6 items-center gap-2">
                    <Button asChild variant="ghost" className="flex-1">
                        <Link href="/" aria-current={isHome ? "page" : undefined} className={cn("flex flex-col items-center gap-1 py-2 text-xs", isHome ? "text-primary font-bold" : "text-muted-foreground")}>
                            <Home size={20} />
                            <span>Home</span>
                        </Link>
                    </Button>

                    <Button asChild variant="ghost" className="flex-1">
                        <Link href="/search" aria-current={isSearch ? "page" : undefined} className={cn("flex flex-col items-center gap-1 py-2 text-xs", isSearch ? "text-primary font-bold" : "text-muted-foreground")}>
                            <Search size={20} />
                            <span>Search</span>
                        </Link>
                    </Button>

                    <Button asChild variant="ghost" className="flex-1">
                        <Link href="/messages" aria-current={isMessages ? "page" : undefined} className={cn("flex flex-col items-center gap-1 py-2 text-xs", isMessages ? "text-primary font-bold" : "text-muted-foreground")}>
                            <MessagesSquare size={20} />
                            <span>DMs</span>
                        </Link>
                    </Button>

                    <div className="flex justify-center">
                        <Link href="/post" aria-label="Create post" aria-current={isPost ? "page" : undefined} className={cn("w-14 h-14 -mt-3 inline-flex items-center justify-center rounded-full bg-primary text-background shadow-md", isPost && "ring-2 ring-white/20")}>
                            <Plus size={20} />
                        </Link>
                    </div>

                    <Button asChild variant="ghost" className="flex-1">
                        <Link href="/notifications" aria-current={isNotifications ? "page" : undefined} className={cn("flex flex-col items-center gap-1 py-2 text-xs", isNotifications ? "text-primary font-bold" : "text-muted-foreground")}>
                            <Bell size={20} />
                            <span>Alerts</span>
                        </Link>
                    </Button>

                    <Button asChild variant="ghost" className="flex-1">
                        <Link href={`/${session.user.handle}`} aria-current={isProfile ? "page" : undefined} className={cn("flex flex-col items-center gap-1 py-2 text-xs", isProfile ? "text-primary font-bold" : "text-muted-foreground")}>
                            <User size={20} />
                            <span>Profile</span>
                        </Link>
                    </Button>
                </div>
            </nav>
        </>
    );
}
