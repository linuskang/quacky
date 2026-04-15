// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

"use client";

// Libraries
import { notFound } from "next/navigation";
import { useState, useEffect, use } from "react";
import { authClient } from "@/client/auth"

// UI Components
import RightSidebar from "@/components/quacky/discover";
import Sidebar from "@/components/quacky/sidebar";
import Posts from "@/components/quacky/posts";
import Replies from "@/components/quacky/replies";
import Reply from "@/components/quacky/reply";
import Loading from "@/components/loading";
import Login from "@/components/login";

// Utilities
import { getPost } from "@/client/utils";

// Types
import { type Post } from "@/types";

interface Props {
    params: Promise<{
        id: string;
    }>
}

export default function PostPage(
    { params }: Props
) {
    // States
    const { data: session, isPending } = authClient.useSession();
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);
    const { id } = use(params);

    // fetch post data
    async function fetchPost() {
        try {
            const data = await getPost(id);
            setPost(data);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        setLoading(true);
        fetchPost();
    }, [id]);

    if (loading || isPending) {
        return (
            <Loading />
        );
    }

    if (!session) {
        return <Login />;
    }

    if (!post) {
        notFound();
    }

    return (
        <main className="min-h-screen w-full flex flex-col items-center bg-background dark:bg-background">
            <div className="flex w-full max-w-[1200px] flex-1 gap-4 px-4">
                <Sidebar
                    session={session}
                />

                <div className="flex-1 flex flex-col gap-4 pt-8 max-w-2xl">
                    <Posts posts={[post]} />
                    {!post.readOnly && (
                        <>
                            <Reply postId={id} onReplySuccess={fetchPost} />

                            <div className="flex flex-col gap-2">
                                <h2 className="text-xl font-bold text-primary px-1">
                                    Replies
                                </h2>
                                <Replies replies={post.replies ?? []} />
                            </div>
                        </>
                    )}
                </div>

                <RightSidebar
                    session={session}
                />
            </div>

            <footer className="w-full py-4 text-center text-xs text-muted-foreground">
                (c) Linus Kang 2026. All Rights Reserved.
            </footer>
        </main>
    );
}
