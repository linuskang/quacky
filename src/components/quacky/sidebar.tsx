// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://linuskang.au/quacky

"use client";

// Libraries
import Link from "next/link";

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
    Briefcase
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
                        className="justify-start gap-3 px-4 py-6 rounded-lg bg-transparent hover:bg-white/10 text-base font-bold text-primary cursor-pointer"
                    >
                        <Link href="/">
                            <Home size={28} strokeWidth={3} />
                            <span>Home</span>
                        </Link>
                    </Button>

                    <Button
                        asChild
                        variant="ghost"
                        className="justify-start gap-3 px-4 py-6 rounded-lg bg-transparent hover:bg-white/10 text-base font-bold text-primary cursor-pointer"
                    >
                        <Link href="/search">
                            <Search size={28} strokeWidth={3} />
                            <span>Search</span>
                        </Link>
                    </Button>

                    <Button
                        asChild
                        variant="ghost"
                        className="justify-start gap-3 px-4 py-6 rounded-lg bg-transparent hover:bg-white/10 text-base font-bold text-primary cursor-pointer"
                    >
                        <Link href="/messages">
                            <MessagesSquare size={28} strokeWidth={3} />
                            <span>Messages</span>
                        </Link>
                    </Button>

                    <Button
                        asChild
                        variant="ghost"
                        className="justify-start gap-3 px-4 py-6 rounded-lg bg-transparent hover:bg-white/10 text-base font-bold text-primary cursor-pointer"
                    >
                        <Link href={`/fuzzies`}>
                            <Briefcase size={28} strokeWidth={3} />
                            <span>Warm Fuzzies</span>
                        </Link>
                    </Button>

                    <Button
                        asChild
                        variant="ghost"
                        className="justify-start gap-3 px-4 py-6 rounded-lg bg-transparent hover:bg-white/10 text-base font-bold text-primary cursor-pointer"
                    >
                        <Link href="/shorts">
                            <Clapperboard size={28} strokeWidth={3} />
                            <span>Shorts</span>
                        </Link>
                    </Button>

                    <Button
                        asChild
                        variant="ghost"
                        className="justify-start gap-3 px-4 py-6 rounded-lg bg-transparent hover:bg-white/10 text-base font-bold text-primary cursor-pointer"
                    >
                        <Link href="/notifications">
                            <Bell size={28} strokeWidth={3} />
                            <span>Notifications</span>
                        </Link>
                    </Button>

                    <Button
                        asChild
                        variant="ghost"
                        className="justify-start gap-3 px-4 py-6 rounded-lg bg-transparent hover:bg-white/10 text-base font-bold text-primary cursor-pointer"
                    >
                        <Link href={`/${session.user.handle}`}>
                            <User size={28} strokeWidth={3} />
                            <span>Profile</span>
                        </Link>
                    </Button>

                    <Button
                        asChild
                        variant="ghost"
                        className="justify-start gap-3 px-4 py-6 rounded-lg bg-transparent hover:bg-white/10 text-base font-bold text-primary cursor-pointer"
                    >
                        <Link href={`/settings`}>
                            <Settings size={28} strokeWidth={3} />
                            <span>Settings</span>
                        </Link>
                    </Button>

                    {session.user.role == "Admin" && (
                        <Button
                            asChild
                            variant="ghost"
                            className="justify-start gap-3 px-4 py-6 rounded-lg bg-transparent hover:bg-white/10 text-base font-bold text-primary cursor-pointer"
                        >
                            <Link href="/admin">
                                <ShieldCheck size={28} strokeWidth={3} />
                                <span>Admin Portal</span>
                            </Link>
                        </Button>
                    )}
                </div>

                <Button
                    asChild
                    className="justify-center px-4 py-6 rounded-lg bg-primary hover:bg-primary/90 text-base font-bold text-background w-full cursor-pointer"
                >
                    <Link href="/post">
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
                        <Link href="/" className="flex flex-col items-center gap-1 py-2 text-xs text-muted-foreground">
                            <Home size={20} />
                            <span>Home</span>
                        </Link>
                    </Button>

                    <Button asChild variant="ghost" className="flex-1">
                        <Link href="/search" className="flex flex-col items-center gap-1 py-2 text-xs text-muted-foreground">
                            <Search size={20} />
                            <span>Search</span>
                        </Link>
                    </Button>

                    <Button asChild variant="ghost" className="flex-1">
                        <Link href="/messages" className="flex flex-col items-center gap-1 py-2 text-xs text-muted-foreground">
                            <MessagesSquare size={20} />
                            <span>DMs</span>
                        </Link>
                    </Button>

                    <div className="flex justify-center">
                        <Link href="/post" aria-label="Create post" className="w-14 h-14 -mt-3 inline-flex items-center justify-center rounded-full bg-primary text-background shadow-md">
                            <Plus size={20} />
                        </Link>
                    </div>

                    <Button asChild variant="ghost" className="flex-1">
                        <Link href="/notifications" className="flex flex-col items-center gap-1 py-2 text-xs text-muted-foreground">
                            <Bell size={20} />
                            <span>Alerts</span>
                        </Link>
                    </Button>

                    <Button asChild variant="ghost" className="flex-1">
                        <Link href={`/${session.user.handle}`} className="flex flex-col items-center gap-1 py-2 text-xs text-muted-foreground">
                            <User size={20} />
                            <span>Profile</span>
                        </Link>
                    </Button>
                </div>
            </nav>
        </>
    );
}
