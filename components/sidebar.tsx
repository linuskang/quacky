"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { exo2, patrickHand, playfairDisplay } from "@/app/layout";

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
import Image from "next/image";

import { Button } from "@/components/ui/button";

import { CurvedLine } from "@/components/curved_parabola";

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
            <Image className="mx-auto mt-4"
                src="/quacky.png"
                alt="Quacky logo"
                width={200}
                height={200}
            />

            <CurvedLine
                from={{ x: 160, y: 100 }}
                to={{ x: 220, y: 150 }}
                stroke="currentColor"
                strokeWidth={3}
                wobble={-100}
            />

            <span
                className={`${patrickHand.className} absolute left-60 top-35 text-xl w-full font-bold`}
            >
                logo drawn by my sis {":)"}
            </span>

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
                                    ? `text-3xl font-bold ${playfairDisplay.className} text-primary !bg-background`
                                    : "text-primary/80 text-2xl !bg-background"
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