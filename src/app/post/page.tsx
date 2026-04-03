// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

"use client";

// Libraries
import { useRouter } from "next/navigation";
import { authClient } from "@/client/auth";

// Components
import Compose from "@/components/quacky/compose";
import RightSidebar from "@/components/quacky/discover";
import Sidebar from "@/components/quacky/sidebar";
import Loading from "@/components/loading";
import Login from "@/components/login";

export default function Post() {
    const { data: session, isPending } = authClient.useSession();
    const router = useRouter();

    if (isPending) {
        return (
            <Loading />
        )
    }

    if (!session) {
        return (
            <Login />
        );
    }

    return (
        <main className="min-h-screen w-full flex justify-center bg-background dark:bg-background">
            <div className="flex w-full max-w-[1200px] gap-4 px-4">
                <Sidebar
                    session={session}
                />

                <div className="flex-1 flex flex-col gap-4 pt-8 max-w-2xl">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center">
                            <div>
                                <div className="flex items-center text-primary">
                                    <h1 className="text-2xl font-bold">Create a Post</h1>
                                </div>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Share an update, a photo, or a file with your followers.
                                </p>
                            </div>
                        </div>
                    </div>

                    <Compose
                        onPost={(result) => {
                            const newPostId = result.id;

                            router.push(`/post/${newPostId}`);
                            return;
                        }}
                    />

                </div>

                <RightSidebar
                    session={session}
                />
            </div>
        </main>
    );
}
