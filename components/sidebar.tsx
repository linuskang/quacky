"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { exo2, playfairDisplay } from "@/app/layout";

import {
    Home,
    Search,
    Bell,
    User,
    Plus,
    MessagesSquare,
    Clapperboard,
    Settings,
    Briefcase,
    Bookmark,
    TrendingUp,
    MessageCircleCheck,
    GraduationCap,
    FerrisWheel,
} from "lucide-react";

import { Button } from "@/components/ui/button";

interface Props {
    session: {
        user: {
            handle: string;
            image?: string | null;
        };
    };
}

export function Sidebar({ session }: Props) {
    const pathname = usePathname();

    const items = [
        { href: "/post", label: "home", icon: Home },
        { href: "/search", label: "search", icon: Search },
        { href: "/messages", label: "messages", icon: MessagesSquare },
        { href: "/fuzzies", label: "warm fuzzies", icon: Briefcase },
        { href: "/trending", label: "trending", icon: TrendingUp },
        { href: "/check-in", label: "daily check in", icon: MessageCircleCheck },
        { href: "/emotion-wheel", label: "emotion wheel", icon: FerrisWheel },
        { href: "/bookmarks", label: "bookmarks", icon: Bookmark },
        { href: "/notifications", label: "notifications", icon: Bell },
        { href: `/${session.user.handle}`, label: "profile", icon: User },
    ];

    return (
        <div className={`h-full flex flex-col ${exo2.className}`}>
            <h1 className="text-3xl font-black text-primary px-4 pt-4 pb-6">
                Quacky
            </h1>

            <nav className="flex flex-col gap-1 px-2 flex-1 justify-center">
                {items.map(({ href, label, icon: Icon }) => {
                    const active = pathname === href;

                    return (
                        <Button
                            key={href}
                            asChild
                            variant="ghost"
                            className={cn(
                                "w-full justify-start rounded-full h-11 text-base transition-colors",
                                active
                                    ? `text-3xl font-semibold ${playfairDisplay.className} text-primary`
                                    : "text-primary/80 text-2xl hover:text-primary hover:bg-primary/10"
                            )}
                            style={active ? { fontStyle: "italic" } : undefined}
                        >
                            <Link href={href}>
                                <Icon className="mr-3 h-12 w-12" strokeWidth={3} />
                                {label}
                            </Link>
                        </Button>
                    );
                })}

                <Button
                    asChild
                    className="mt-4 w-full h-11 rounded-full bg-primary-2 text-background hover:bg-primary-2/80 text-base font-semibold"
                >
                    <Link href="/post">
                        <Plus className="mr-1 h-12 w-12" strokeWidth={3} />
                        Post
                    </Link>
                </Button>
            </nav>
        </div>
    );
}