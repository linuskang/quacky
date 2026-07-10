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

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { Admin } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

type MentionProfile = {
    name: string;
    username: string;
    image?: string;
    verified?: boolean;
    role?: string | null;
    bio?: string | null;
    banned?: boolean | null;
};

export function MentionHoverCard({ username }: { username: string }) {
    const [open, setOpen] = useState(false);
    const [profile, setProfile] = useState<MentionProfile | null>(null);

    useEffect(() => {
        const controller = new AbortController();

        if (!open || profile) return;

        async function fetchProfile() {
            const res = await fetch(`/api/user/${encodeURIComponent(username)}`, {
                signal: controller.signal,
            });

            if (!res.ok) return;

            const data = await res.json() as MentionProfile;
            setProfile(data);
        }

        fetchProfile().catch((error) => {
            if (error instanceof DOMException && error.name === "AbortError") return;
        });

        return () => controller.abort();
    }, [open, profile, username]);

    return (
        <HoverCard open={open} onOpenChange={setOpen} openDelay={150} closeDelay={100}>
            <HoverCardTrigger asChild>
                <span className="cursor-pointer break-words font-medium text-primary-2 underline-offset-2 [overflow-wrap:anywhere] hover:underline">
                    @{username}
                </span>
            </HoverCardTrigger>
            <HoverCardContent
                align="start"
                className="w-72 border-2 border-border bg-background p-3"
                onClick={(event) => event.stopPropagation()}
            >
                {profile ? (
                    <div className="flex flex-col gap-3">
                        <div className="flex items-start gap-3">
                            <Image
                                src={profile.image ?? "/default-avatar.png"}
                                alt={profile.name}
                                width={44}
                                height={44}
                                unoptimized
                                className="h-11 w-11 rounded-full object-cover"
                            />
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1">
                                    <span className="truncate text-sm font-semibold text-primary">
                                        {profile.name}
                                    </span>
                                    {profile.verified && (
                                        <BadgeCheck className="h-4 w-4 shrink-0 fill-primary text-background" />
                                    )}
                                    {profile.role === "admin" && (
                                        <Admin />
                                    )}
                                </div>
                                <div className="truncate text-sm font-medium text-muted-foreground">
                                    @{profile.username}
                                </div>
                            </div>
                        </div>
                        {profile.bio && (
                            <p className="line-clamp-3 text-sm text-muted-foreground">
                                {profile.bio}
                            </p>
                        )}
                        <Button
                            asChild
                            size="sm"
                            className="h-8 rounded-full bg-primary-2 text-sm font-semibold hover:bg-primary-2/80"
                        >
                            <Link href={`/@${profile.username}`}>
                                View profile
                            </Link>
                        </Button>
                    </div>
                ) : (
                    <div className="text-sm text-muted-foreground">Loading profile...</div>
                )}
            </HoverCardContent>
        </HoverCard>
    );
}
