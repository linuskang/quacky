"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { TrendingUp, Hash, BadgeCheck, UserPlus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface Props {
    session: {
        user: {
            name: string;
            handle: string;
            image?: string | null;
        }
    } | null;
}

interface TrendingTag {
    tag: string;
    count: number;
}

interface SuggestedUser {
    id: string;
    name: string;
    handle: string;
    image?: string | null;
    verified: boolean;
    followers: number;
}

interface FooterProps {
    version: string;
}

function Footer({ version }: FooterProps) {
    return (
        <div className="mt-auto p-2 rounded-lg bg-card -mb-4 ml-2 flex flex-col gap-2">
            <div className="flex flex-wrap gap-x-3 gap-y-1">
                <Link href="/home" className="text-xs text-muted-foreground hover:text-primary transition">About</Link>
                <Link href="/privacy" className="text-xs text-muted-foreground hover:text-primary transition">Privacy</Link>
                <Link href="/terms" className="text-xs text-muted-foreground hover:text-primary transition">Terms</Link>
            </div>
            <p className="text-xs text-muted-foreground">
                &copy; {new Date().getFullYear()} {" "} Linus Kang &middot; CC BY-NC 4.0
            </p>
            <p className="text-xs text-muted-foreground">
                Quacky is {version}
            </p>
        </div>
    );
}

function WhoToFollow({ session }: { session: Props["session"] }) {
    const [users, setUsers] = useState<SuggestedUser[]>([]);
    const [followed, setFollowed] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!session) {
            setLoading(false);
            return;
        }
        setLoading(true);
        fetch("/api/v1/users/suggested")
            .then((r) => r.json())
            .then((d) => setUsers(d.users ?? []))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [session]);

    async function follow(user: SuggestedUser) {
        setFollowed((prev) => new Set(prev).add(user.id));
        await fetch(`/api/v1/users/${user.handle}/follow`, { method: "POST" });
    }

    if (loading) {
        return (
            <div className="rounded-xl bg-card border border-border p-4">
                <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                    <UserPlus size={22} strokeWidth={3} />
                    Who to Follow
                </h2>
                <div className="flex flex-col gap-3">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center gap-3 animate-pulse">
                            <div className="w-9 h-9 rounded-full bg-muted shrink-0" />
                            <div className="flex-1 flex flex-col gap-1.5">
                                <div className="h-3 w-24 rounded bg-muted" />
                                <div className="h-2.5 w-16 rounded bg-muted" />
                            </div>
                            <div className="h-7 w-16 rounded-full bg-muted" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (users.length === 0) return null;

    return (
        <div className="rounded-xl bg-card border border-border p-4">
            <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                <UserPlus size={22} strokeWidth={3} />
                Who to Follow
            </h2>
            <div className="flex flex-col gap-1">
                {users.map((user) => (
                    <div key={user.id} className="flex items-center gap-3 rounded-lg px-0 py-2 hover:bg-primary/5 transition">
                        <Link href={`/${user.handle}`} className="shrink-0">
                            <Avatar className="w-9 h-9">
                                <AvatarImage src={user.image ?? ""} alt={user.name} />
                                <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                                    {user.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                        </Link>
                        <Link href={`/${user.handle}`} className="flex-1 min-w-0">
                            <div className="flex items-center gap-1 min-w-0">
                                <span className="font-bold text-sm text-primary truncate leading-tight">
                                    {user.name}
                                </span>
                                {user.verified && (
                                    <BadgeCheck size={13} className="text-primary shrink-0" />
                                )}
                            </div>
                            <span className="text-xs text-muted-foreground truncate block leading-tight">
                                @{user.handle}
                            </span>
                        </Link>
                        <Button
                            size="sm"
                            variant={followed.has(user.id) ? "outline" : "default"}
                            className="rounded-full h-7 px-3 text-xs shrink-0 cursor-pointer"
                            onClick={() => follow(user)}
                            disabled={followed.has(user.id)}
                        >
                            {followed.has(user.id) ? (
                                <><Check size={11} className="mr-1" />Following</>
                            ) : (
                                "Follow"
                            )}
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function Rightbar({ session, className }: Props & { className?: string }) {
    const [trending, setTrending] = useState<TrendingTag[]>([]);

    useEffect(() => {
        fetch("/api/v1/hashtags/trending")
            .then((r) => r.json())
            .then((d) => setTrending(d.trending ?? []))
            .catch(() => { });
    }, [session]);

    return (
        <aside className={className ?? "sticky top-0 w-60 shrink-0 hidden lg:flex flex-col gap-2 pt-8 lg:h-screen overflow-y-auto pb-8"}>
            <div className="rounded-xl bg-card border border-border p-4">
                <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                    <TrendingUp size={24} strokeWidth={3} />
                    Trending
                </h2>
                <div className="flex flex-col gap-1">
                    {trending.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No trending hashtags yet.</p>
                    ) : (
                        trending.map(({ tag, count }) => (
                            <Link
                                key={tag}
                                href={`/hashtag/${tag}`}
                                className="flex items-center justify-between rounded-lg px-2 py-2 hover:bg-primary/5 transition group"
                            >
                                <div className="flex items-center gap-2">
                                    <Hash size={15} className="text-muted-foreground shrink-0" />
                                    <span className="font-bold text-primary text-sm group-hover:underline">{tag}</span>
                                </div>
                                <span className="text-xs text-muted-foreground font-medium">{count} post{count !== 1 ? "s" : ""}</span>
                            </Link>
                        ))
                    )}
                </div>
            </div>

            <WhoToFollow session={session} />

            <Footer 
                version="v0.0.3-beta"
            />
        </aside>
    );
}
