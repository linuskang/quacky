// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

"use client";

// Libraries
import Link from "next/link";
import { Suspense, startTransition, useDeferredValue, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/client/auth";

// UI Components
import { BadgeCheck, LoaderCircle, Lock, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import RightSidebar from "@/components/quacky/discover";
import Posts from "@/components/quacky/posts";
import Sidebar from "@/components/quacky/sidebar";

// Types
import type { Post } from "@/types";
import Login from "@/components/login";
import Loading from "@/components/loading";

interface SearchUserResult {
    id: string;
    name: string;
    handle: string;
    image: string | null;
    bio: string | null;
    verified: boolean;
    privateAccount: boolean;
}

interface SearchResponse {
    success: boolean;
    error?: string;
    users?: SearchUserResult[];
    posts?: Post[];
}

export default function SearchPage() {
    return (
        <Suspense fallback={<Loading />}>
            <SearchPageContent />
        </Suspense>
    );
}

function SearchPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentUrlQuery = searchParams.get("q") ?? "";
    const initialQuery = currentUrlQuery;
    const { data: session, isPending } = authClient.useSession();

    const [query, setQuery] = useState(initialQuery);
    const deferredQuery = useDeferredValue(query.trim());
    const [users, setUsers] = useState<SearchUserResult[]>([]);
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const normalizedQuery = query.trim();

        if (normalizedQuery === currentUrlQuery) {
            return;
        }

        const params = new URLSearchParams(searchParams.toString());

        if (normalizedQuery) {
            params.set("q", normalizedQuery);
        } else {
            params.delete("q");
        }

        const nextQueryString = params.toString();
        const nextPath = nextQueryString ? `/search?${nextQueryString}` : "/search";

        startTransition(() => {
            router.replace(nextPath);
        });
    }, [currentUrlQuery, query, router, searchParams]);

    useEffect(() => {
        if (!deferredQuery) {
            setUsers([]);
            setPosts([]);
            setError("");
            setIsLoading(false);
            return;
        }

        const controller = new AbortController();

        const fetchResults = async () => {
            try {
                setIsLoading(true);
                setError("");

                const response = await fetch(`/api/v1/search?q=${encodeURIComponent(deferredQuery)}`, {
                    signal: controller.signal,
                });

                const data = await response.json() as SearchResponse;

                if (!response.ok || !data.success) {
                    setUsers([]);
                    setPosts([]);
                    setError(data.error ?? "Search failed");
                    return;
                }

                setUsers(data.users ?? []);
                setPosts(data.posts ?? []);
            } catch (fetchError) {
                if (fetchError instanceof Error && fetchError.name === "AbortError") {
                    return;
                }

                setUsers([]);
                setPosts([]);
                setError("Search failed");
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            }
        };

        fetchResults();

        return () => controller.abort();
    }, [deferredQuery]);

    if (isPending) {
        return <Loading />
    }

    if (!session) {
        return <Login />
    }

    const hasResults = users.length > 0 || posts.length > 0;

    return (
        <main className="min-h-screen w-full flex justify-center bg-background dark:bg-background">
            <div className="flex w-full max-w-[1200px] gap-4 px-4">
                <Sidebar
                    session={session}
                />

                <div className="flex-1 flex flex-col gap-4 pt-8 max-w-2xl">
                    <div className="rounded-xl border border-border bg-[var(--lynt)] p-5">
                        <div className="flex items-center gap-3 text-primary">
                            <div>
                                <h1 className="text-xl font-bold">Search</h1>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Find people and posts across Quacky.
                                </p>
                            </div>
                        </div>

                        <div className="mt-4">
                            <label htmlFor="search-query" className="sr-only">Search query</label>
                            <div className="flex items-center gap-3 rounded-xl border border-border bg-background/70 px-4 py-3">
                                <Search size={18} className="text-muted-foreground" />
                                <input
                                    id="search-query"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search users and posts"
                                    className="w-full bg-transparent text-primary outline-none placeholder:text-muted-foreground"
                                />
                                {isLoading && <LoaderCircle size={18} className="animate-spin text-primary" />}
                            </div>
                        </div>

                    </div>

                    {!deferredQuery && (
                        <div className="p-10 text-center">
                            <h2 className="text-lg font-bold text-primary">Start searching</h2>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Try a name, handle, or words from a post.
                            </p>
                        </div>
                    )}

                    {deferredQuery && error && (
                        <div className="p-5 text-sm text-destructive">
                            {error}
                        </div>
                    )}

                    {deferredQuery && !error && !isLoading && !hasResults && (
                        <div className="p-10 text-center">
                            <h2 className="text-lg font-bold text-primary">No results found</h2>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Nothing matched &ldquo;{deferredQuery}&rdquo;. Try a broader search term.
                            </p>
                        </div>
                    )}

                    {users.length > 0 && (
                        <section className="flex flex-col gap-3">
                            <h2 className="text-lg font-bold text-primary">Users</h2>

                            {users.map((user) => (
                                <Link
                                    key={user.id}
                                    href={`/${user.handle}`}
                                    className="rounded-xl border border-border bg-[var(--lynt)] p-4 transition-colors hover:bg-accent/40"
                                >
                                    <div className="flex items-start gap-3">
                                        <Avatar className="size-12 shrink-0">
                                            <AvatarImage src={user.image ?? ""} alt={user.name} />
                                            <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                                {user.name.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="truncate font-bold text-primary">{user.name}</span>
                                                {user.verified && (
                                                    <BadgeCheck size={18} className="shrink-0 text-primary" fill="currentColor" stroke="var(--lynt)" />
                                                )}
                                            </div>

                                            <p className="mt-0.5 text-sm font-semibold text-muted-foreground">@{user.handle}</p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </section>
                    )}

                    {posts.length > 0 && (
                        <section className="flex flex-col gap-3">
                                <h2 className="text-lg font-bold text-primary">Posts</h2>

                            <Posts posts={posts} />
                        </section>
                    )}

                </div>

                <RightSidebar
                    session={session}
                />
            </div>
        </main>
    );
}
