import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/server/auth";
import { prisma } from "@/server/prisma";
import { PageLayout, PageCenter, PageRight } from "@/components/page-layout";
import { SearchBar } from "@/components/search-bar";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { BadgeCheck } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Link from "next/link";

export default async function Page({
    params,
}: {
    params: Promise<{ handle: string }>;
}) {
    const { handle } = await params;

    const session = await auth.api.getSession({
        headers: await headers(),
    });

    const user = await prisma.user.findUnique(
        {
            where: { username: handle },
            include: {
                following: {
                    select: {
                        follow: {
                            select: {
                                name: true,
                                username: true,
                                image: true,
                            },
                        },
                    },
                },
                followers: {
                    select: {
                        user: {
                            select: {
                                name: true,
                                username: true,
                                image: true,
                            },
                        },
                    },
                },
            },
        }
    );

    if (!user) {
        notFound();
    }

    const following = user.following.map(({ follow }) => follow);
    const followers = user.followers.map(({ user }) => user);

    return (
        <PageLayout>
            <PageCenter>
                <div>
                    <Card className="!bg-profile-card">
                        <CardHeader className="p-0 -mt-4">
                            <Image
                                src={`https://api.dicebear.com/10.x/disco/svg?seed=${user.username}`}
                                alt={user.name ?? "User"}
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
                                        src={user.image || ""}
                                        alt={user.name ?? "User"}
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

                                {session?.user.username == user.username && (
                                    <div className="ml-auto mb-auto">
                                        <Button
                                            variant="default"
                                            className="h-10 px-3 font-semibold text-base rounded-full"
                                        >
                                            Edit Profile
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {user.bio ? (
                                <p className="mt-3 whitespace-pre-wrap text-base">
                                    {user.bio}
                                </p>
                            ) : (
                                <p className="mt-3 whitespace-pre-wrap text-muted-foreground italic text-base">
                                    User has not added a bio yet.
                                </p>
                            )}


                            <div className="mt-2 mb-2 text-muted-foreground font-semibold">
                                Joined {user.createdAt.toLocaleDateString("en-US", {
                                    day: "numeric",
                                    year: "numeric",
                                    month: "long",
                                })}
                            </div>

                            <Dialog>
                                <DialogTrigger asChild>
                                    <a
                                        className="hover:underline hover:cursor-pointer text-xs font-semibold mr-4"
                                    >
                                        {followers.length} <span className="font-normal">Followers</span>
                                    </a>
                                </DialogTrigger>
                                <DialogContent className="!bg-card border-2 border-border">
                                    <DialogHeader>
                                        <DialogTitle className="text-lg font-bold">Followers</DialogTitle>
                                    </DialogHeader>

                                    <div className="flex flex-col gap-2">
                                        {user.followers.length > 0 ? (
                                            user.followers.map((followerUser) => (
                                                <Link
                                                    href={`/@${followerUser.user.username}`}
                                                    key={followerUser.user.username}
                                                    className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-border"
                                                >
                                                    <Image
                                                        src={followerUser.user.image || `https://api.dicebear.com/9.x/glass/svg?seed=${user.username}`}
                                                        alt={user.name}
                                                        width={40}
                                                        height={40}
                                                        unoptimized
                                                        className="h-10 w-10 rounded-full object-cover"
                                                    />
                                                    <div className="min-w-0">
                                                        <p className="truncate font-semibold text-foreground">
                                                            {followerUser.user.name}
                                                        </p>
                                                        <p className="truncate text-muted-foreground">
                                                            @{followerUser.user.username}
                                                        </p>
                                                    </div>
                                                </Link>
                                            ))
                                        ) : (
                                            <p className="py-4 text-center text-muted-foreground">
                                                No followers yet.
                                            </p>
                                        )}
                                    </div>
                                </DialogContent>
                            </Dialog>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <a
                                        className="hover:underline hover:cursor-pointer text-xs font-semibold"
                                    >
                                        {following.length} <span className="font-normal">Following</span>
                                    </a>
                                </DialogTrigger>
                                <DialogContent className="!bg-card border-2 border-border">
                                    <DialogHeader>
                                        <DialogTitle className="text-lg font-bold">Following</DialogTitle>
                                    </DialogHeader>

                                    <div className="flex flex-col gap-2">
                                        {user.following.length > 0 ? (
                                            user.following.map((followingUser) => (
                                                <Link
                                                    href={`/@${followingUser.follow.username}`}
                                                    key={followingUser.follow.username}
                                                    className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-border"
                                                >
                                                    <Image
                                                        src={followingUser.follow.image || `https://api.dicebear.com/9.x/glass/svg?seed=${user.username}`}
                                                        alt={user.name}
                                                        width={40}
                                                        height={40}
                                                        unoptimized
                                                        className="h-10 w-10 rounded-full object-cover"
                                                    />
                                                    <div className="min-w-0">
                                                        <p className="truncate font-semibold text-foreground">
                                                            {followingUser.follow.name}
                                                        </p>
                                                        <p className="truncate text-muted-foreground">
                                                            @{followingUser.follow.username}
                                                        </p>
                                                    </div>
                                                </Link>
                                            ))
                                        ) : (
                                            <p className="py-4 text-center text-muted-foreground">
                                                No followers yet.
                                            </p>
                                        )}
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </CardContent>
                    </Card>
                </div>
            </PageCenter>
            <PageRight>
                <SearchBar />
            </PageRight>
        </PageLayout>
    );
}
