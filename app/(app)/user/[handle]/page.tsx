import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/server/auth";
import { prisma } from "@/server/prisma";
import { PageLayout, PageCenter, PageRight } from "@/components/page-layout";
import { SearchBar } from "@/components/search-bar";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { BadgeCheck } from "lucide-react";

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
        }
    );

    if (!user) {
        notFound();
    }

    return (
        <PageLayout>
            <PageCenter>
                <div>
                    <Card className="!bg-profile-card">
                        <CardHeader className="p-0 -mt-4">
                            <img
                                src={`https://api.dicebear.com/10.x/disco/svg?seed=${user.username}`}
                                alt={user.name ?? "User"}
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


                            <div className="mt-2 text-muted-foreground text- font-semibold">
                                Joined {user.createdAt.toLocaleDateString("en-US", {
                                    day: "numeric",
                                    year: "numeric",
                                    month: "long",
                                })}
                            </div>

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
