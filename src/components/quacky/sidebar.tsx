//    ____                   _          
//   / __ \                 | |         
//  | |  | |_   _  __ _  ___| | ___   _ 
//  | |  | | | | |/ _` |/ __| |/ / | | |
//  | |__| | |_| | (_| | (__|   <| |_| |
//   \___\_\\__,_|\__,_|\___|_|\_\\__, |
//                                 __/ |
//                                |___/ 

"use client";

// Libraries
import Link from "next/link";
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
    LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Account from "@/components/quacky/account";

// Types
interface NavItem {
    href: string;
    label: string;
    icon: LucideIcon;
}

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
    const pathname = usePathname();

    const isActive = (href: string) => {
        if (!pathname) return false;
        if (href === "/") return pathname === "/";
        return pathname === href || pathname.startsWith(href + "/");
    };

    const navItems: NavItem[] = [
        { href: "/", label: "Home", icon: Home },
        { href: "/search", label: "Search", icon: Search },
        { href: "/messages", label: "Messages", icon: MessagesSquare },
        { href: "/fuzzies", label: "Warm Fuzzies", icon: Briefcase },
        { href: "/shorts", label: "Shorts", icon: Clapperboard },
        { href: "/bookmarks", label: "Bookmarks", icon: Bookmark },
        { href: "/notifications", label: "Notifications", icon: Bell },
        { href: `/${session.user.handle}`, label: "Profile", icon: User },
        { href: "/settings", label: "Settings", icon: Settings },
    ];

    if (session.user.role === "Admin") {
        navItems.push({ href: "/admin", label: "Admin Portal", icon: ShieldCheck });
    }

    const navButtonClass = (active: boolean) => cn(
        "justify-start gap-3 rounded-lg px-4 py-6 text-base font-bold transition-colors ",
        active
            ? "bg-primary/20 text-primary dark:hover:!bg-primary/30"
            : "text-muted-foreground dark:hover:!bg-primary/20"
    );

    return (
        <aside className="sticky top-0 z-50 hidden h-screen w-60 shrink-0 flex-col gap-4 pt-8 lg:flex">

            <div className="text-center mb-1.5">
                <h1 className="text-6xl font-extrabold tracking-tight text-primary dark:text-primary-dark">
                    Quacky
                </h1>
            </div>

            <div className="flex flex-col rounded-lg border border-border bg-card p-2">
                {navItems.map(({ href, label, icon: Icon }) => {
                    const active = isActive(href);
                    return (
                        <Button
                            key={href}
                            asChild
                            variant="ghost"
                            className={navButtonClass(active)}
                        >
                            <Link href={href} aria-current={active ? "page" : undefined}>
                                <Icon size={28} strokeWidth={3} />
                                <span>{label}</span>
                            </Link>
                        </Button>
                    );
                })}
            </div>

            <Button
                asChild
                className="w-full justify-center rounded-lg bg-primary px-4 py-6 text-base font-bold text-background transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary/70"
            >
                <Link href="/post" aria-current={isActive("/post") ? "page" : undefined}>
                    <Plus size={24} strokeWidth={3} />
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
    );
}
