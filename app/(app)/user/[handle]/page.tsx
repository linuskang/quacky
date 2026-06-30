"use client";

import { notFound } from "next/navigation";
import { PageLayout, PageCenter, PageRight } from "@/components/page-layout";
import { SearchBar } from "@/components/search-bar";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { BadgeCheck, CalendarDays, ExternalLink, MapPin } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { authClient } from "@/client/auth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ProfileUser = {
    id: string;
    name?: string;
    username: string;
    image?: string | null;
    bannerImage?: string | null;
    createdAt: string;
    verified?: boolean;
    private?: boolean;
    bio?: string | null;
    website?: string | null;
    location?: string | null;
    pronoun?: string | null;
    followers?: string[];
};

export default function Page() {
    const [user, setUser] = useState<ProfileUser | null>(null);
    const [following, setFollowing] = useState(false);
    const [followPending, setFollowPending] = useState(false);
    const { handle } = useParams();
    const { data: session, isPending } = authClient.useSession();

    useEffect(() => {
        async function fetchUser() {
            const res = await fetch(`/api/user/${handle}`);

            if (!res.ok) {
                notFound();
            } else {
                const data = await res.json() as ProfileUser;
                if (!data.id) {
                    notFound();
                }
                setUser(data);
                setFollowing(data.followers?.includes(session?.user.username ?? "") ?? false);
            }
        }
        fetchUser();
    }, [handle, session?.user.username]);

    async function toggleFollow() {
        if (!user || followPending) return;

        setFollowPending(true);

        const nextFollowing = !following;
        const res = await fetch(`/api/user/${user.username}/follow`, {
            method: nextFollowing ? "POST" : "DELETE",
        });

        if (!res.ok) {
            toast.error(res.statusText);
            setFollowPending(false);
            return;
        }

        setFollowing(nextFollowing);
        setFollowPending(false);
    }


    if (isPending) {
        return null;
    }

    if (!session) return null;

    if (!user) {
        return null;
    }

    return (
        <PageLayout>
            <PageCenter>
                <Card className="overflow-hidden !bg-profile-card">
                    <CardHeader className="p-0 -mt-4">
                        <Image
                            src={user.bannerImage || "https://avatars.linus.my/10.x/micah/svg?seed=sushi"}
                            alt={user.name!}
                            width={1200}
                            height={320}
                            unoptimized
                            className="w-full h-40 object-cover rounded-t-lg"
                        />

                    </CardHeader>
                    <CardContent>
                        <div className="flex">
                            <div className="flex items-start gap-4">
                                <Image
                                    src={user.image!}
                                    alt={user.name!}
                                    width={50}
                                    height={50}
                                    unoptimized
                                    className="h-15 w-15 rounded-full object-cover"
                                />

                                <div className="flex flex-col">
                                    <h1 className="text-2xl font-bold flex items-center gap-1">
                                        {user.name}
                                        {user.verified && (
                                            <BadgeCheck
                                                className="h-[20px] w-[20px] fill-primary text-profile-card"
                                            />
                                        )}
                                        {user.pronoun && (
                                            <span className="text-sm text-muted-foreground">
                                                ({user.pronoun})
                                            </span>
                                        )}
                                    </h1>
                                    <p className="text-base text-muted-foreground">
                                        @{user.username}
                                    </p>
                                </div>
                            </div>

                            <div className="ml-auto mb-auto">
                                {user.id === session.user.id ? (
                                    <Button
                                        variant="secondary"
                                        className="h-8 rounded-full bg-primary-2 px-4 text-sm font-semibold text-background hover:bg-primary-2/80"
                                    >
                                        Edit Profile
                                    </Button>
                                ) : (
                                    <Button
                                        variant={following ? "secondary" : "default"}
                                        disabled={followPending}
                                        onClick={toggleFollow}
                                        className="h-8 rounded-full bg-primary-2 px-4 text-sm font-semibold text-background hover:bg-primary-2/80"
                                    >
                                        {followPending ? "Saving..." : following ? "Unfollow" : "Follow"}
                                    </Button>
                                )}
                            </div>
                        </div>

                        {user.bio ? (
                            <p className="mt-3 whitespace-pre-wrap text-base">
                                {user.bio}
                            </p>
                        ) : (
                            <p className="mt-3 whitespace-pre-wrap text-muted-foreground italic text-base">
                                {user.private ? "This profile is private." : "No bio yet."}
                            </p>
                        )}

                        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1 font-semibold">
                                <CalendarDays className="h-4 w-4" strokeWidth={3} />
                                Joined {new Date(user.createdAt).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                })}
                            </span>

                            {user.location && (
                                <span className="flex items-center font-semibold gap-1">
                                    <MapPin className="h-4 w-4" strokeWidth={3} />
                                    {user.location}
                                </span>
                            )}

                            {user.website && (
                                <a
                                    href={user.website}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center font-semibold gap-1 hover:underline"
                                >
                                    <ExternalLink className="h-4 w-4" strokeWidth={3} />
                                    {user.website.replace(/^https?:\/\//, "")}
                                </a>
                            )}
                        </div>
                    </CardContent>

                    <Tabs defaultValue="posts" className="w-full gap-0 border-t-2 -mt-2 border-border">
                        <TabsList variant="line" className="h-11 w-full justify-start rounded-none bg-profile-card px-4">
                            <TabsTrigger value="posts" className="px-3 text-sm font-bold">
                                Posts
                            </TabsTrigger>
                            <TabsTrigger value="replies" className="px-3 text-sm font-bold">
                                Replies
                            </TabsTrigger>
                            <TabsTrigger value="badges" className="px-3 text-sm font-bold">
                                Badges
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="posts" className="border-t-2 border-border p-4 text-sm text-muted-foreground">
                            Posts will show here soon.
                        </TabsContent>
                        <TabsContent value="replies" className="border-t-2 border-border p-4 text-sm text-muted-foreground">
                            Replies will show here soon.
                        </TabsContent>
                        <TabsContent value="badges" className="border-t-2 border-border p-4 text-sm text-muted-foreground">
                            Badges will show here soon.
                        </TabsContent>
                    </Tabs>
                </Card>

            </PageCenter>
            <PageRight>
                <SearchBar />
            </PageRight>
        </PageLayout>
    );
}
