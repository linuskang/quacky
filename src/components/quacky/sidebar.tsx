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
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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
    const [collapsed, setCollapsed] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem("sidebar-collapsed");
        if (stored === "true") setCollapsed(true);
    }, []);

    function toggleCollapsed() {
        setCollapsed((prev) => {
            const next = !prev;
            localStorage.setItem("sidebar-collapsed", String(next));
            return next;
        });
    }

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

    const navButtonClass = (active: boolean) => cn(
        "rounded-lg bg-transparent hover:bg-white/10 text-base font-bold text-primary cursor-pointer transition-all duration-200",
        collapsed ? "justify-center px-0 py-5 w-full" : "justify-start gap-3 px-4 py-6",
        active && "bg-white/10"
    );

    return (
        <>
            <aside className={cn(
                "sticky top-0 z-50 shrink-0 hidden lg:flex flex-col gap-4 pt-8 lg:h-screen transition-all duration-200",
                collapsed ? "w-16" : "w-60"
            )}>
                {/* Logo */}
                <div className="text-center mb-1.5">
                    <h1 className={cn(
                        "font-extrabold tracking-tight text-primary dark:text-primary-dark transition-all duration-200",
                        collapsed ? "text-3xl" : "text-6xl"
                    )}>
                        {collapsed ? "Q" : "Quacky"}
                    </h1>
                </div>

                {/* Nav */}
                <div className="rounded-lg p-2 flex flex-col bg-[var(--lynt)] border border-border">
                    <Button asChild variant="ghost" className={navButtonClass(isHome)}>
                        <Link href="/" aria-current={isHome ? "page" : undefined} title={collapsed ? "Home" : undefined}>
                            <Home size={28} strokeWidth={3} />
                            {!collapsed && <span>Home</span>}
                        </Link>
                    </Button>

                    <Button asChild variant="ghost" className={navButtonClass(isSearch)}>
                        <Link href="/search" aria-current={isSearch ? "page" : undefined} title={collapsed ? "Search" : undefined}>
                            <Search size={28} strokeWidth={3} />
                            {!collapsed && <span>Search</span>}
                        </Link>
                    </Button>

                    <Button asChild variant="ghost" className={navButtonClass(isMessages)}>
                        <Link href="/messages" aria-current={isMessages ? "page" : undefined} title={collapsed ? "Messages" : undefined}>
                            <MessagesSquare size={28} strokeWidth={3} />
                            {!collapsed && <span>Messages</span>}
                        </Link>
                    </Button>

                    <Button asChild variant="ghost" className={navButtonClass(isFuzzies)}>
                        <Link href="/fuzzies" aria-current={isFuzzies ? "page" : undefined} title={collapsed ? "Warm Fuzzies" : undefined}>
                            <Briefcase size={28} strokeWidth={3} />
                            {!collapsed && <span>Warm Fuzzies</span>}
                        </Link>
                    </Button>

                    <Button asChild variant="ghost" className={navButtonClass(isShorts)}>
                        <Link href="/shorts" aria-current={isShorts ? "page" : undefined} title={collapsed ? "Shorts" : undefined}>
                            <Clapperboard size={28} strokeWidth={3} />
                            {!collapsed && <span>Shorts</span>}
                        </Link>
                    </Button>

                    <Button asChild variant="ghost" className={navButtonClass(isNotifications)}>
                        <Link href="/notifications" aria-current={isNotifications ? "page" : undefined} title={collapsed ? "Notifications" : undefined} className="relative">
                            <Bell size={28} strokeWidth={3} />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white px-0.5">
                                    {unreadCount > 99 ? "99+" : unreadCount}
                                </span>
                            )}
                            {!collapsed && <span>Notifications</span>}
                        </Link>
                    </Button>

                    <Button asChild variant="ghost" className={navButtonClass(isBookmarks)}>
                        <Link href="/bookmarks" aria-current={isBookmarks ? "page" : undefined} title={collapsed ? "Bookmarks" : undefined}>
                            <Bookmark size={28} strokeWidth={3} />
                            {!collapsed && <span>Bookmarks</span>}
                        </Link>
                    </Button>

                    <Button asChild variant="ghost" className={navButtonClass(isProfile)}>
                        <Link href={`/${session.user.handle}`} aria-current={isProfile ? "page" : undefined} title={collapsed ? "Profile" : undefined}>
                            <User size={28} strokeWidth={3} />
                            {!collapsed && <span>Profile</span>}
                        </Link>
                    </Button>

                    <Button asChild variant="ghost" className={navButtonClass(isSettings)}>
                        <Link href="/settings" aria-current={isSettings ? "page" : undefined} title={collapsed ? "Settings" : undefined}>
                            <Settings size={28} strokeWidth={3} />
                            {!collapsed && <span>Settings</span>}
                        </Link>
                    </Button>

                    {session.user.role === "Admin" && (
                        <Button asChild variant="ghost" className={navButtonClass(isAdmin)}>
                            <Link href="/admin" aria-current={isAdmin ? "page" : undefined} title={collapsed ? "Admin Portal" : undefined}>
                                <ShieldCheck size={28} strokeWidth={3} />
                                {!collapsed && <span>Admin Portal</span>}
                            </Link>
                        </Button>
                    )}

                    {/* Collapse toggle */}
                    <button
                        onClick={toggleCollapsed}
                        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                        className={cn(
                            "mt-1 flex items-center rounded-lg py-2 text-xs font-semibold text-muted-foreground hover:bg-white/10 transition-colors",
                            collapsed ? "justify-center px-0" : "justify-end gap-1 px-3"
                        )}
                    >
                        {collapsed
                            ? <ChevronRight size={16} />
                            : <><ChevronLeft size={16} /><span>Collapse</span></>
                        }
                    </button>
                </div>

                {/* Post button */}
                <Button
                    asChild
                    className={cn(
                        "rounded-lg bg-primary hover:bg-primary/90 text-base font-bold text-background w-full cursor-pointer transition-all duration-200",
                        isPost && "ring-2 ring-white/20",
                        collapsed ? "justify-center px-0 py-6" : "justify-center px-4 py-6"
                    )}
                >
                    <Link href="/post" aria-current={isPost ? "page" : undefined} title={collapsed ? "Post" : undefined}>
                        {collapsed ? <Plus size={24} strokeWidth={3} /> : <span>Post</span>}
                    </Link>
                </Button>

                {/* Account */}
                <div className="mt-auto mb-8">
                    {collapsed ? (
                        <Link href="/settings" title="Settings">
                            <div className="flex justify-center p-2 rounded-full hover:bg-[var(--lynt)] transition-colors cursor-pointer">
                                <Avatar className="w-10 h-10">
                                    <AvatarImage src={session.user.image || ""} alt="Avatar" />
                                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                        {(session.user.name || session.user.handle || "").charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                        </Link>
                    ) : (
                        <Account
                            username={session.user.handle}
                            displayName={session.user.name}
                            avatarUrl={session.user.image || ""}
                        />
                    )}
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
