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
    MessagesSquare,
    Briefcase,
    Bookmark,
    TrendingUp,
    MessageCircleCheck,
    GraduationCap,
    FerrisWheel,
    Store,
} from "lucide-react";
import Image from "next/image";

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
        { href: "/", label: "home", icon: Home },
        { href: "/search", label: "search", icon: Search },
        { href: "/dms", label: "dms", icon: MessagesSquare },
        { href: "/fuzzies", label: "warm fuzzies", icon: Briefcase },
        { href: "/trending", label: "trending", icon: TrendingUp },
        { href: "/check-in", label: "daily check in", icon: MessageCircleCheck },
        { href: "/emotion-wheel", label: "emotion wheel", icon: FerrisWheel },
        // { href: "/games", label: "games", icon: Swords },
        { href: "/bookmarks", label: "bookmarks", icon: Bookmark },
        { href: "/shop", label: "shop", icon: Store },
        // { href: "/resources", label: "resources", icon: GraduationCap },
        // { href: "/missions", label: "missions", icon: BadgeQuestionMark },
        { href: "/notifications", label: "notifications", icon: Bell },
        { href: `/@${session.user.handle}`, label: "profile", icon: User },
    ];

    return (
        <div className={`h-full flex flex-col ${exo2.className}`}>
            <Link href="/">
                <Image className="mx-auto mt-4"
                    src="/quacky.png"
                    alt="Quacky logo"
                    width={200}
                    height={200}
                />
            </Link>

            <nav className="flex flex-col gap-1 px-2 flex-1 justify-center">
                {items.map(({ href, label, icon: Icon }) => {
                    const active = pathname === href;

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
                        </Link>
                    );
                })}

                <Button
                    asChild
                    className="mt-4 w-full h-11 rounded-full bg-primary-2 text-background hover:bg-primary-2/80 text-base font-semibold"
                >
                    <Link href="/post">
                        Post
                    </Link>
                </Button>
            </nav>
        </div>
    );
}