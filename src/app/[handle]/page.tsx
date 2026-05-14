// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

"use client";

// Libraries
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useState, useEffect, use } from "react";

// UI Components
import { BadgeCheck, Ban, CalendarClock, Shield, LinkIcon, MapPin } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import RightSidebar from "@/components/quacky/discover";
import Sidebar from "@/components/quacky/sidebar";
import Posts from "@/components/quacky/posts";
import FollowButton from "@/components/quacky/follow-button";
import { ReportAbuse } from "@/components/quacky/report";
import Loading from "@/components/loading";
import Login from "@/components/login";

// Types
import { Post, User } from "@/types";
import { authClient } from "@/client/auth";

interface FollowUser {
    id: string;
    name: string;
    handle: string;
    image?: string | null;
    verified: boolean;
    isFollowedByMe: boolean;
}


interface Params {
    params: Promise<{
        handle: string;
    }>;
}

export default function ProfilePage(
    { params }: Params
) {
    const router = useRouter();

    // Param
    const { handle } = use(params);

    // States
    const { data: session, isPending } = authClient.useSession();
    const [user, setUser] = useState<User | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [followersOpen, setFollowersOpen] = useState(false);
    const [followingOpen, setFollowingOpen] = useState(false);
    const [reportOpen, setReportOpen] = useState(false);
    const [followers, setFollowers] = useState<FollowUser[]>([]);
    const [following, setFollowing] = useState<FollowUser[]>([]);

    useEffect(() => {
        const fetchUser = async () => {
            const res = await fetch(`/api/v1/users/${handle}`, { cache: "no-store" });
            if (res.ok) {
                const userData = await res.json();
                setUser(userData.user as User);
                setPosts(userData.posts as Post[]);
            }
        };
        fetchUser();
    }, [handle]);

    if (isPending) {
        return (
            <Loading />
        );
    }

    if (!session) {
        return (
            <Login />
        )
    }

    async function loadFollowers() {
        if (followers.length > 0) return;
        const res = await fetch(`/api/v1/users/${handle}/followers`);
        if (res.ok) {
            const d = await res.json();
            setFollowers(d.users ?? d.followers ?? []);
        }
    }

    async function loadFollowing() {
        if (following.length > 0) return;
        const res = await fetch(`/api/v1/users/${handle}/following`);
        if (res.ok) {
            const d = await res.json();
            setFollowing(d.users ?? d.following ?? []);
        }
    }

    async function messageUser(targetUserId: string) {
        const res = await fetch("/api/v1/messages/conversations", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ targetUserId }),
        });

        const data = await res.json();

        if (res.ok && data?.success && data?.conversation?.id) {
            router.push(`/messages?c=${data.conversation.id}`);
        }
    }

    async function reportUser(type: string, reason: string) {
        const res = await fetch(`/api/v1/users/${handle}/report`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ type, reason }),
        });

        if (!res.ok) {
            const data = await res.json().catch(() => null);
            throw new Error(data?.error || "Failed to report user");
        }
    }

    if (!user) {
        return (
            <main className="min-h-screen w-full flex justify-center bg-background dark:bg-background">
                <div className="flex w-full max-w-[1200px] gap-4 px-4">
                    <Sidebar
                        session={session}
                    />
                    <div className="flex-1 flex flex-col gap-4 pt-8 max-w-2xl">
                        <div className="rounded-xl border border-border p-6 text-center">
                            <h1 className="text-4xl font-bold text-primary mb-2">404</h1>
                            <h2 className="text-xl font-bold text-primary mb-2">Profile Not Found</h2>
                            <p className="text-muted-foreground">This user doesn't exist or is unavailable.</p>
                        </div>
                    </div>
                    <RightSidebar
                        session={session}
                    />
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen w-full flex justify-center bg-background dark:bg-background">
            <div className="flex w-full max-w-[1200px] gap-4 px-4">
                <Sidebar
                    session={session}
                />

                <div
                    className="flex-1 flex flex-col gap-4 pt-8 max-w-2xl"
                    style={{ ...(user.accentColor && user.accentColor !== "#1d9bf0" ? { '--primary': user.accentColor } as React.CSSProperties : {}) }}
                >
                    <div className="rounded-xl border border-border bg-card overflow-hidden">
                        {user.banner && (
                            <div className="h-32 w-full bg-cover bg-center" style={{ backgroundImage: `url(${user.banner})` }}></div>
                        )}
                        <div className="p-6">
                            <div className="flex items-start gap-4 mb-6">
                                <Avatar className={`size-20 flex-shrink-0 ${user.banner ? '-mt-12' : ''}`}>
                                    <AvatarImage src={user.image || ""} alt={`${user.handle} avatar`} className="bg-background"/>
                                    <AvatarFallback className="bg-primary text-background text-xl font-bold">
                                        {(user.name || user.handle || "?").charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                        <h1 className="text-2xl font-bold text-primary">{user.name}</h1>
                                        {user.pronouns && (
                                            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-primary/10 text-primary">
                                                {user.pronouns}
                                            </span>
                                        )}
                                        {user.verified && (
                                            <BadgeCheck
                                                className="text-primary flex-shrink-0"
                                                size={20}
                                                fill="currentColor"
                                                stroke="var(--lynt)"
                                            />
                                        )}
                                    </div>

                                    {user.handle && (
                                        <p className="text-muted-foreground font-bold text-sm mb-3">
                                            @{user.handle}
                                        </p>
                                    )}

                                <div className="flex gap-3">
                                    {session.user.id !== user.id && !user.banned && (
                                        <>
                                            <FollowButton handle={user.handle} />
                                            <Button
                                                variant="outline"
                                                className="rounded-lg font-bold cursor-pointer"
                                                onClick={() => void messageUser(user.id)}
                                            >
                                                Message
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="rounded-lg font-bold cursor-pointer"
                                                onClick={() => setReportOpen(true)}
                                            >
                                                Report
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {!user.banned && (
                            <div className="flex gap-6 text-sm mb-4">
                                <button
                                    className="text-center cursor-pointer hover:underline"
                                    onClick={() => { setFollowingOpen(true); loadFollowing(); }}
                                >
                                    <div className="font-bold text-primary">{user.following}</div>
                                    <div className="text-muted-foreground">Following</div>
                                </button>
                                <button
                                    className="text-center cursor-pointer hover:underline"
                                    onClick={() => { setFollowersOpen(true); loadFollowers(); }}
                                >
                                    <div className="font-bold text-primary">{user.followers}</div>
                                    <div className="text-muted-foreground">Followers</div>
                                </button>
                                <div className="text-center">
                                    <div className="font-bold text-primary">{user.posts}</div>
                                    <div className="text-muted-foreground">Posts</div>
                                </div>
                            </div>
                        )}

                        {user.banned && (
                            <div className="mt-1 mb-4 flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3">
                                <Ban size={16} className="shrink-0 text-red-700" />
                                <p className="text-sm text-red-700">
                                    This user has been banned due to a violation of our community guidelines. <a href="/help/banned" className="underline">Learn More</a>
                                </p>
                            </div>
                        )}



                        {user.bio && (
                            <p className="text-base text-primary leading-relaxed mb-4 whitespace-pre-line">
                                {user.bio}
                            </p>
                        )}

                        <div className="flex flex-wrap gap-4 text-sm font-bold text-muted-foreground">
                            {user.location && (
                                <span className="flex items-center gap-1.5">
                                    <MapPin size={16} strokeWidth={2.5} />
                                    {user.location}
                                </span>
                            )}
                            {user.website && (
                                <span className="flex items-center gap-1.5">
                                    <LinkIcon size={16} strokeWidth={2.5} />
                                    <a href={user.website.startsWith('http') ? user.website : `https://${user.website}`} target="_blank" rel="noopener noreferrer" className="hover:underline text-primary">
                                        {user.website.replace(/^https?:\/\//, '')}
                                    </a>
                                </span>
                            )}
                            {user.createdAt && (
                                <span className="flex items-center gap-1.5">
                                    <CalendarClock size={16} strokeWidth={2.5} />
                                    Joined {format(new Date(user.createdAt), "MMMM yyyy")}
                                </span>
                            )}
                            {user.role === "Admin" && (
                                <span className="flex items-center gap-1.5">
                                    <Shield size={16} fill="currentColor" strokeWidth={2.5} />
                                    Admin
                                </span>
                            )}
                        </div>

                        </div>
                    </div>
                    {user.privateAccount && (
                        <div className="rounded-xl border border-border p-4 mb-4 text-center">
                            <h2 className="text-xl font-bold text-primary mb-2">Private Account</h2>
                            <p className="text-muted-foreground">This user account is private</p>
                        </div>
                    )}
                    {!user.banned && !user.privateAccount && (
                        posts.length > 0 ? (
                            <Posts posts={posts} />
                        ) : (
                            <div className="rounded-xl border border-border p-6 text-center">
                                <h2 className="text-xl font-bold text-primary mb-2">No Posts Yet</h2>
                                <p className="text-muted-foreground">This user hasn't posted anything yet.</p>
                            </div>
                        )
                    )}
                </div>

                <RightSidebar
                    session={session}
                />
            </div>

            {/* Followers dialog */}
            <Dialog open={followersOpen} onOpenChange={setFollowersOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Followers</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-1">
                        {followers.length === 0 ? (
                            <p className="text-muted-foreground text-sm text-center py-4">No followers yet.</p>
                        ) : followers.map((u) => (
                            <a key={u.id} href={`/${u.handle}`} className="flex items-center gap-3 hover:bg-primary/5 rounded-lg p-2 transition">
                                <Avatar className="w-9 h-9 shrink-0">
                                    <AvatarImage src={u.image || ""} />
                                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">{u.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1">
                                        <span className="font-bold text-primary text-sm truncate">{u.name}</span>
                                        {u.verified && <BadgeCheck size={14} className="text-primary shrink-0" fill="currentColor" stroke="var(--lynt)" />}
                                    </div>
                                    <span className="text-muted-foreground text-xs">@{u.handle}</span>
                                </div>
                                {u.isFollowedByMe && (
                                    <span className="text-xs font-semibold text-muted-foreground border border-border rounded-full px-2 py-0.5">Following</span>
                                )}
                            </a>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>

            <ReportAbuse
                isOpen={reportOpen}
                onClose={() => setReportOpen(false)}
                onSubmit={reportUser}
                title={`Report @${user.handle}`}
                description={`Tell us why you're reporting @${user.handle}. This will be sent to the moderation team for review.`}
                submitLabel="Send Report"
                successTitle="Report sent"
                successDescription="Thanks for the report. We'll review it as soon as possible."
                defaultType="harassment"
            />

            {/* Following dialog */}
            <Dialog open={followingOpen} onOpenChange={setFollowingOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Following</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-1">
                        {following.length === 0 ? (
                            <p className="text-muted-foreground text-sm text-center py-4">Not following anyone yet.</p>
                        ) : following.map((u) => (
                            <a key={u.id} href={`/${u.handle}`} className="flex items-center gap-3 hover:bg-primary/5 rounded-lg p-2 transition">
                                <Avatar className="w-9 h-9 shrink-0">
                                    <AvatarImage src={u.image || ""} />
                                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">{u.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1">
                                        <span className="font-bold text-primary text-sm truncate">{u.name}</span>
                                        {u.verified && <BadgeCheck size={14} className="text-primary shrink-0" fill="currentColor" stroke="var(--lynt)" />}
                                    </div>
                                    <span className="text-muted-foreground text-xs">@{u.handle}</span>
                                </div>
                                {u.isFollowedByMe && (
                                    <span className="text-xs font-semibold text-muted-foreground border border-border rounded-full px-2 py-0.5">Following</span>
                                )}
                            </a>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </main>
    );
}
