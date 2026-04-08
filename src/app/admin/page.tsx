// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://linuskang.au/quacky

// This is the administration panel.
// access it at /admin.
// only users with the "Admin" role can access this page.

"use client";

// Libraries
import { authClient } from "@/client/auth";

// Components
import Login from "@/components/login";
import AdminPanel from "@/components/quacky/admin/panel";
import Sidebar from "@/components/quacky/sidebar";
import Discover from "@/components/quacky/discover";
import Loading from "@/components/loading";

export default function Administration() {
    const { data: session, isPending } = authClient.useSession();

    if (isPending) {
        return <Loading />;
    }

    // admins only. otherwise login
    if (!session || session.user.role !== "Admin") {
        return <Login />;
    }

    return (
        <main className="min-h-screen w-full flex justify-center bg-background dark:bg-background">
            <div className="flex w-full max-w-[1200px] gap-4 px-4 pb-24 lg:pb-8">
                <Sidebar
                    session={session}
                />

                <div className="flex-1 pt-8 min-w-0 lg:max-w-2xl">
                    <AdminPanel />
                </div>

                <Discover
                    session={session}
                />
            </div>
        </main>
    );
}
