// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

"use client";

// Libraries
import { format } from "date-fns";
import { useState, useEffect, use } from "react";

// UI Components
import { BadgeCheck, Ban, CalendarClock, Shield } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import RightSidebar from "@/components/quacky/discover";
import Sidebar from "@/components/quacky/sidebar";
import Posts from "@/components/quacky/posts";
import Loading from "@/components/loading";
import Login from "@/components/login";

// Types
import { Post, User } from "@/types";
import { authClient } from "@/client/auth";


interface Params {
    params: Promise<{
        handle: string;
    }>;
}

export default function ProfilePage(
    { params }: Params
) {
    // Param
    const { handle } = use(params);

    // States
    const { data: session, isPending } = authClient.useSession();
    const [user, setUser] = useState<User | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);

    useEffect(() => {
        const fetchUser = async () => {
            const res = await fetch(`/api/v1/users/${handle}`);
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

                <div className="flex-1 flex flex-col gap-4 pt-8 max-w-2xl">


                    <div className="rounded-xl border border-border bg-[var(--lynt)] p-6">
                        <div className="flex items-start gap-4 mb-6">

                            <Avatar className="size-20 border-4 border-[var(--lynt)] flex-shrink-0">
                                <AvatarImage src={user.image || ""} alt={`${user.handle} avatar`} />
                                <AvatarFallback className="bg-primary text-background text-xl font-bold">
                                    {(user.name || user.handle || "?").charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                    <h1 className="text-2xl font-bold text-primary">{user.name}</h1>
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
                                    {/* <FollowButton targetUserHandle={user.handle} /> */}
                                    {/* <Button variant="outline" className="rounded-lg font-bold cursor-pointer">Message</Button> */}
                                </div>
                            </div>
                        </div>

                        {!user.banned && (
                            <div className="flex gap-6 text-sm mb-4">
                                <div className="text-center">
                                    <div className="font-bold text-primary">{user.following}</div>
                                    <div className="text-muted-foreground">Following</div>
                                </div>
                                <div className="text-center">
                                    <div className="font-bold text-primary">{user.followers}</div>
                                    <div className="text-muted-foreground">Followers</div>
                                </div>
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

                        {user.privateAccount && (
                            <div className="rounded-xl border border-border -mt-1 p-4 mb-4 text-center">
                                <h2 className="text-xl font-bold text-primary mb-2">Private Account</h2>
                                <p className="text-muted-foreground">This user account is private</p>
                            </div>
                        )}

                        {user.bio && (
                            <p className="text-base text-primary leading-relaxed mb-4 whitespace-pre-line">
                                {user.bio}
                            </p>
                        )}

                        <div className="flex flex-wrap gap-4 text-sm font-bold text-muted-foreground">
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
        </main>
    );
}
