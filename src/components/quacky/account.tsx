"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";

type AccountProps = {
    username: string;
    displayName: string;
    avatarUrl: string;
};

export default function Account({ username, displayName, avatarUrl }: AccountProps) {
    const initial = (displayName || username || "").charAt(0).toUpperCase();

    return (
        <Link href="/settings">
            <div className="p-3 cursor-pointer rounded-full hover:bg-[var(--lynt)] transition-colors">
                <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12 shrink-0">
                        <AvatarImage
                            src={avatarUrl || ""}
                            alt={"User Avatar"}
                        />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                            {initial}
                        </AvatarFallback>
                    </Avatar>

                    <div className="flex flex-col min-w-0 flex-1">
                        <span className="font-bold text-primary text-sm truncate">{displayName}</span>
                        <span className="text-muted-foreground text-xs truncate">@{username}</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
