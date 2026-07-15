"use client";

import { useState } from "react";
import { authClient } from "@/client/auth";
import axios from "axios"
import { PageLayout, PageCenter } from "@/components/page-layout";
import { Title, Description } from "@/components/text";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import Image from 'next/image'
import Loading from "../loading";
import Link from 'next/link';

export default function Page() {
    const { data: session, isPending } = authClient.useSession();
    if (isPending) {
        return (
            <Loading />
        )
    }

    if (!session) return redirect("/auth/login")
    return (
        <PageLayout>
            <PageCenter>
                <Title>random number gaem 👾</Title>
                <Description>GAMBLING GAMBLING GAMBLING GAMBLING GAMBLING YAY</Description>

                <p className="text-muted-foreground font-semibold text-sm">
                    Ok but seriously, the person who has the highest rolled number wins <span className="font-bold text-primary">nothing!</span> because clout is the best reward 😎
                </p>

                <p className="text-muted-foreground font-semibold text-sm mt-2">
                    resets in <span className="font-bold text-primary"> 7 days</span>
                </p>

                <Card className="bg-card-primary mt-4 p-4">
                    <div className="flex flex-col gap-2 items-center">
                        <h1 className="text-muted-foreground font-bold text-sm">YOUR NUMBER TODAY</h1>
                        <h1 className="text-5xl font-bold text-primary">42</h1>
                        <p className="text-primary-2 font-semibold text-sm">
                            not too shabby
                        </p>
                        <p className="text-muted-foreground font-semibold text-xs">
                            #123 today
                        </p>

                        <div className="flex gap-2">
                            <Button
                                variant="secondary"
                                className="mt-4 h-10 text-lg font-semibold rounded-full px-4"
                                onClick={() => redirect("/rng/history")}
                            >
                                see history
                            </Button>

                            <Button
                                variant="default"
                                className="mt-4 h-10 text-lg font-semibold bg-primary-2 rounded-full px-4"
                                onClick={() => redirect("/rng/roll")}
                            >
                                share number
                            </Button>
                        </div>
                    </div>
                </Card>
                <div className="mt-4 flex flex-col items-center justify-center gap-4">
                    <h1 className="text-primary font-bold text-2xl">Today</h1>
                    <p className="text-muted-foreground font-semibold -mt-3 text-sm">250 rolls</p>
                </div>
                <div className="flex justify-center">
                    <Card className="mt-4 flex h-50 w-full max-w-[15rem] flex-col items-center justify-center gap-2 bg-card-primary p-4">
                        <h1 className="text-lg font-bold text-primary-2">
                            #1
                        </h1>

                        <Image
                            src={session.user.image ?? "/default-avatar.png"}
                            alt={session.user.name ?? "User"}
                            width={60}
                            height={60}
                            className="h-[60px] w-[60px] rounded-full object-cover"
                        />

                        <Link
                            href={`/@${session.user.username}`}
                            className="hover:underline"
                        >
                            <p className="text-lg font-bold text-primary hover:text-primary-2">
                                {session.user.name}
                            </p>
                        </Link>

                        <p className="text-2xl font-semibold text-primary-2">
                            42
                        </p>
                    </Card>
                </div>

                <div className="mt-4 flex justify-center gap-4">
                    {/* #2 */}
                    <Card className="flex h-40 w-full max-w-[11rem] flex-col mr-auto items-center justify-center gap-2 bg-card-primary p-4">
                        <h1 className="text-base font-bold text-primary-2">
                            #2
                        </h1>

                        <Image
                            src={session.user.image ?? "/default-avatar.png"}
                            alt={session.user.name ?? "User"}
                            width={50}
                            height={50}
                            className="rounded-full object-cover"
                        />

                        <Link
                            href={`/@${session.user.username}`}
                            className="hover:underline"
                        >
                            <p className="font-bold text-primary hover:text-primary-2">
                                {session.user.name}
                            </p>
                        </Link>

                        <p className="text-xl font-semibold text-primary-2">
                            39
                        </p>
                    </Card>

                    {/* #3 */}
                    <Card className="flex h-40 w-full max-w-[11rem] flex-col ml-auto items-center justify-center gap-2 bg-card-primary p-4">
                        <h1 className="text-base font-bold text-primary-2">
                            #3
                        </h1>

                        <Image
                            src={session.user.image ?? "/default-avatar.png"}
                            alt={session.user.name ?? "User"}
                            width={50}
                            height={50}
                            className="rounded-full object-cover"
                        />

                        <Link
                            href={`/@${session.user.username}`}
                            className="hover:underline"
                        >
                            <p className="font-bold text-primary hover:text-primary-2">
                                {session.user.name}
                            </p>
                        </Link>

                        <p className="text-xl font-semibold text-primary-2">
                            37
                        </p>
                    </Card>
                </div>
                <div className="gap-1.5 flex flex-col">
                    <Card className="bg-card-primary p-3">
                        <div className="flex items-center">
                            <div className="mr-auto flex items-center">
                                <h1 className="text-muted-foreground font-bold text-sm mr-5">#4</h1>
                                <Image
                                    src={session.user.image!}
                                    alt="linus"
                                    width={30}
                                    height={30}
                                    className="mr-3 rounded-full"
                                />
                                <Link
                                    href={`/@${session.user.username}`}
                                    className="hover:underline"
                                >
                                    <p className="text-primary font-bold text-lg">linus</p>
                                </Link>
                            </div>
                            <div className="ml-auto flex items-center">
                                <p className="text-primary-2 font-semibold text-lg mr-3">42</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="bg-card-primary p-3">
                        <div className="flex items-center">
                            <div className="mr-auto flex items-center">
                                <h1 className="text-muted-foreground font-bold text-sm mr-5">#4</h1>
                                <Image
                                    src={session.user.image!}
                                    alt="linus"
                                    width={30}
                                    height={30}
                                    className="mr-3 rounded-full"
                                />
                                <Link
                                    href={`/@${session.user.username}`}
                                    className="hover:underline"
                                >
                                    <p className="text-primary font-bold text-lg">linus</p>
                                </Link>
                            </div>
                            <div className="ml-auto flex items-center">
                                <p className="text-primary-2 font-semibold text-lg mr-3">42</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="bg-card-primary p-3">
                        <div className="flex items-center">
                            <div className="mr-auto flex items-center">
                                <h1 className="text-muted-foreground font-bold text-sm mr-5">#4</h1>
                                <Image
                                    src={session.user.image!}
                                    alt="linus"
                                    width={30}
                                    height={30}
                                    className="mr-3 rounded-full"
                                />
                                <Link
                                    href={`/@${session.user.username}`}
                                    className="hover:underline"
                                >
                                    <p className="text-primary font-bold text-lg">linus</p>
                                </Link>
                            </div>
                            <div className="ml-auto flex items-center">
                                <p className="text-primary-2 font-semibold text-lg mr-3">42</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="bg-card-primary p-3">
                        <div className="flex items-center">
                            <div className="mr-auto flex items-center">
                                <h1 className="text-muted-foreground font-bold text-sm mr-5">#4</h1>
                                <Image
                                    src={session.user.image!}
                                    alt="linus"
                                    width={30}
                                    height={30}
                                    className="mr-3 rounded-full"
                                />
                                <Link
                                    href={`/@${session.user.username}`}
                                    className="hover:underline"
                                >
                                    <p className="text-primary font-bold text-lg">linus</p>
                                </Link>
                            </div>
                            <div className="ml-auto flex items-center">
                                <p className="text-primary-2 font-semibold text-lg mr-3">42</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="bg-card-primary p-3">
                        <div className="flex items-center">
                            <div className="mr-auto flex items-center">
                                <h1 className="text-muted-foreground font-bold text-sm mr-5">#4</h1>
                                <Image
                                    src={session.user.image!}
                                    alt="linus"
                                    width={30}
                                    height={30}
                                    className="mr-3 rounded-full"
                                />
                                <Link
                                    href={`/@${session.user.username}`}
                                    className="hover:underline"
                                >
                                    <p className="text-primary font-bold text-lg">linus</p>
                                </Link>
                            </div>
                            <div className="ml-auto flex items-center">
                                <p className="text-primary-2 font-semibold text-lg mr-3">42</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </PageCenter>
        </PageLayout>
    )
}