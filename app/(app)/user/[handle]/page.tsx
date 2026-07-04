
import { notFound } from "next/navigation";
import { PageLayout, PageCenter, PageRight } from "@/components/page-layout";
import { SearchBar } from "@/components/search-bar";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { BadgeCheck, CalendarDays, ExternalLink, MapPin } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { requireSession } from "@/server/auth";
import { getUser } from "@/server/users";
import { ProfileAction } from "./action";
import { PurpleWarning } from "@/components/warning";
import Link from "next/link";
import { Markdown } from "@/components/md";

// This profile page is split into multiple parts:
// Server utilities (server functions for fetching user data, and follow/unfollow functions)
// Server component (this page)
// Client component (profile action e.g. follow/edit profile, along with its server sided utilities at ./action.tsx and ./helpers.ts)

export default async function Page(
    { params }: { params: Promise<{ handle: string }> }
) {
    // Basics: Fetch session, and user from param.
    const session = await requireSession();
    const { handle } = await params;
    const user = await getUser(handle);

    // if the user doesn't exist.
    if (!user) {
        notFound();
    }

    const followsYou = user.following.includes(session.user.username);
    const following = user.followers.includes(session.user.username);

    return (
        <PageLayout>
            <PageCenter>
                <Link href="/" className="mb-3 flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
                    Go back
                </Link>
                <Card className="overflow-hidden !bg-profile-card">
                    <CardHeader className="p-0 -mt-4">
                        {!user.banned && user.bannerImage && (
                            <Image
                                src={user.bannerImage}
                                alt={user.name!}
                                width={1200}
                                height={320}
                                unoptimized
                                className="w-full h-40 object-cover rounded-t-lg"
                            />
                        )}
                    </CardHeader>
                    <CardContent>
                        <div className="flex">
                            <div className="flex items-start gap-4">
                                <Image
                                    src={user.image}
                                    alt={user.name}
                                    width={50}
                                    height={50}
                                    unoptimized
                                    className="h-15 w-15 rounded-full object-cover"
                                />

                                <div className="flex flex-col">
                                    <h1 className="text-2xl font-bold flex items-center gap-1">
                                        {user.name}
                                        {!user.banned && (
                                            <>
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
                                                {followsYou && (
                                                    <span className="ml-1 rounded-full bg-card px-2 py-0.5 text-xs font-semibold text-primary">
                                                        Follows you
                                                    </span>
                                                )}
                                            </>
                                        )}
                                    </h1>
                                    <p className="text-base text-muted-foreground">
                                        @{user.username}
                                    </p>
                                </div>
                            </div>

                            {!user.banned && (
                                <div className="ml-auto mb-auto">
                                    <ProfileAction
                                        currentUserId={session.user.id}
                                        initialBio={user.bio}
                                        initialBannerImage={user.bannerImage}
                                        initialFollowing={following}
                                        initialImage={user.image}
                                        initialLocation={user.location}
                                        initialName={user.name}
                                        initialPronoun={user.pronoun}
                                        initialWebsite={user.website}
                                        userId={user.id}
                                        username={user.username}
                                    />
                                </div>
                            )}
                        </div>

                        {user.banned && (
                            <div className="mt-3">
                                <PurpleWarning text="This user is banned." />
                            </div>
                        )}

                        {!user.banned && (
                            user.bio ? (
                                <Markdown>
                                    {user.bio}
                                </Markdown>
                            ) : (
                                <p className="mt-3 whitespace-pre-wrap text-muted-foreground italic text-base">
                                    {user.private ? "This profile is private." : "No bio yet."}
                                </p>
                            )
                        )}

                        {!user.banned && (
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
                        )}
                    </CardContent>
                </Card>

                {!user.banned && (
                    <Tabs defaultValue="posts" className="w-full gap-0 -mt-2">
                        <TabsList className="mt-3 grid h-auto w-full grid-cols-3 gap-3 rounded-none bg-transparent p-0">
                            <TabsTrigger
                                value="posts"
                                className="h-10 rounded-full border-2 border-border bg-background/80 px-5 text-base font-extrabold text-foreground hover:border-primary data-active:!border-primary data-active:!bg-background"
                            >
                                Posts
                            </TabsTrigger>
                            <TabsTrigger
                                value="replies"
                                className="h-10 rounded-full border-2 border-border bg-background/80 px-5 text-base font-extrabold text-foreground hover:border-primary data-active:!border-primary data-active:!bg-background"
                            >
                                Replies
                            </TabsTrigger>
                            <TabsTrigger
                                value="badges"
                                className="h-10 rounded-full border-2 border-border bg-background/80 px-5 text-base font-extrabold text-foreground hover:border-primary data-active:!border-primary data-active:!bg-background"
                            >
                                Badges
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="posts" className="p-4 text-sm text-muted-foreground">

                        </TabsContent>
                        <TabsContent value="replies" className="p-4 text-sm text-muted-foreground">
                            Replies will show here soon.
                        </TabsContent>
                        <TabsContent value="badges" className="p-4 text-sm text-muted-foreground">
                            Badges will show here soon.
                        </TabsContent>
                    </Tabs>
                )}

            </PageCenter>
            <PageRight>
                <SearchBar />
            </PageRight>
        </PageLayout>
    );
}
