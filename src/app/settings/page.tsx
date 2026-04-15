// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://linuskang.au/quacky

"use client";

// Libraries
import { useEffect, useState } from "react";
import { authClient } from "@/client/auth";

// UI Components
import Loading from "@/components/loading";
import Login from "@/components/login";
import Discover from "@/components/quacky/discover";
import Sidebar from "@/components/quacky/sidebar";
import Settings from "@/components/pages/settings";

type UpdatedSettingsUser = {
    name: string;
    handle: string;
    bio: string;
    image: string | null;
    privateAccount: boolean;
    emailNotif: boolean;
};

export default function SettingsPage() {
    const { data: session, isPending } = authClient.useSession();
    const [updatedUser, setUpdatedUser] = useState<UpdatedSettingsUser | null>(null);

    useEffect(() => {
        setUpdatedUser(null);
    }, [session?.user?.id]);

    if (isPending) {
        return <Loading />
    }

    if (!session) {
        return <Login />
    }

    const effectiveUser = {
        ...session.user,
        ...(updatedUser ?? {}),
    };

    const effectiveSession = {
        ...session,
        user: effectiveUser,
    };

    return (
        <main className="min-h-screen w-full flex flex-col items-center bg-background dark:bg-background">
            <div className="flex w-full max-w-[1200px] flex-1 gap-4 px-4 flex-col lg:flex-row">
                <Sidebar
                    session={effectiveSession}
                />

                <div className="flex-1 flex flex-col pt-8 w-full lg:max-w-2xl">
                    <Settings
                        displayName={effectiveUser.name}
                        handle={effectiveUser.handle}
                        image={effectiveUser.image || ""}
                        bio={effectiveUser.bio || ""}
                        email={effectiveUser.email}
                        privateAccount={effectiveUser.privateAccount}
                        emailNotif={effectiveUser.emailNotif}
                        onSaved={setUpdatedUser}
                    />
                </div>

                <Discover
                    session={effectiveSession}
                />
            </div>

            <footer className="w-full py-4 text-center text-xs text-muted-foreground">
                (c) Linus Kang 2026. All Rights Reserved.
            </footer>
        </main>
    )
}
