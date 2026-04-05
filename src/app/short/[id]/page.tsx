// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://linuskang.au/quacky

"use client";

// Libraries
import { authClient } from "@/client/auth";

// UI Components
import Login from "@/components/login";
import Sidebar from "@/components/quacky/sidebar";
import Discover from "@/components/quacky/discover";
import Loading from "@/components/loading";
import Short from "@/components/quacky/shorts";
import { Short as ShortType } from "@/types";

import { use } from "react";

interface Props {
    params: Promise<{
        id: string;
    }>
}

export default function Homepage(
    { params }: Props
) {
    // States
    const { data: session, isPending } = authClient.useSession();

    const short = use(params);

    console.log(short.id);

    // Loading
    if (isPending) {
        return (
            <Loading />
        )
    }

    // Not logged in
    if (!session) {
        return (
            <Login />
        )
    }

    return (
        <main className="h-screen w-full flex justify-center bg-background dark:bg-background overflow-hidden">
            <div className="flex w-full max-w-[1200px] gap-4 px-4 h-full">
                <Sidebar
                    session={session}
                />

                <div className="flex-1 mt-8 mb-8 flex flex-col scrollbar-none">
                    <Short
                        videoUrl="https://cdn.lkang.au/quacky/shorts/20000940-hd_1080_1920_30fps.mp4"
                        name="Linus Kang"
                        handle="linuskang"
                        description="if u think about it seagulls are actually really cool..."
                        verified={false}
                        avatarUrl={session.user.image || ""}
                    />
                </div>

                <Discover
                    session={session}
                />
            </div>
        </main>
    );
}
