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

export default function Homepage() {
    // States
    const { data: session, isPending } = authClient.useSession();

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
        <main className="min-h-screen w-full flex justify-center bg-background dark:bg-background">
            <div className="flex w-full max-w-[1200px] gap-4 px-4">
                <Sidebar
                    session={session}
                />

                <div className="flex-1 flex flex-col pt-8 w-full lg:max-w-2xl">
                    <h1>This is an example page, you can build off of this structure to add your own pages and content to Quacky.</h1>
                </div>

                <Discover
                    session={session}
                />
            </div>
        </main>
    );
}
