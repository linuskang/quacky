"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

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
            image: string;
        };
    };
}

export function Sidebar({ session }: Props) {
    const pathname = usePathname();

    const items = [
        { href: "/post", label: "Home", icon: Home },
        { href: "/search", label: "Search", icon: Search },
        { href: "/messages", label: "Messages", icon: MessagesSquare },
        { href: "/fuzzies", label: "Warm Fuzzies", icon: Briefcase },
        { href: "/trending", label: "Trending", icon: TrendingUp },
        { href: "/check-in", label: "Daily Check In", icon: MessageCircleCheck },
        { href: "/emotion-wheel", label: "Emotion Wheel", icon: FerrisWheel },
        { href: "/bookmarks", label: "Bookmarks", icon: Bookmark },
        { href: "/notifications", label: "Notifications", icon: Bell },
        { href: `/${session.user.handle}`, label: "Profile", icon: User },
    ];

    return (
        <div className="h-full flex flex-col">
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
                                "w-full justify-start rounded-full h-11 text-base font-semibold transition-colors",
                                active
                                    ? "text-primary font-bold bg-primary/10"
                                    : "text-primary/80 hover:text-primary hover:bg-primary/10"
                            )}
                        >
                            <Link href={href}>
                                <Icon className="mr-3 h-6 w-6" strokeWidth={3} />
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
                        <Plus className="mr-1 h-6 w-6" strokeWidth={3} />
                        Post
                    </Link>
                </Button>
            </nav>
        </div>
    );
}