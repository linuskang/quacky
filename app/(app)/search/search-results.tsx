"use client";

import { useDeferredValue, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Hash } from "lucide-react";
import { PostList } from "@/components/post";
import { SearchBar } from "@/components/search-bar";
import { Admin } from "@/components/icons";
import type { Post } from "@/types";

export type SearchUser = {
    name: string;
    username: string;
    image: string;
    verified: boolean;
    role?: string | null;
    bio?: string | null;
};

export type SearchHashtag = {
    tag: string;
    count: number;
};

export function SearchResults({
    posts,
    users,
    hashtags,
}: {
    posts: Post[];
    users: SearchUser[];
    hashtags: SearchHashtag[];
}) {
    const [query, setQuery] = useState("");
    const deferredQuery = useDeferredValue(query.trim().toLowerCase());




    // ai--------
    const normalizedQuery = deferredQuery.startsWith("#")
        ? deferredQuery.slice(1)
        : deferredQuery;

    const postResults = normalizedQuery
        ? posts.filter((post) => {
            const searchable = [
                post.content,
                post.author.name,
                post.author.username,
                post.repostOf?.content,
                post.repostOf?.author.name,
                post.repostOf?.author.username,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return searchable.includes(normalizedQuery);
        })
        : [];

    const userResults = normalizedQuery
        ? users.filter((user) => {
            const searchable = [user.name, user.username, user.bio]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return searchable.includes(normalizedQuery);
        })
        : [];

    const hashtagResults = normalizedQuery
        ? hashtags.filter((hashtag) => hashtag.tag.toLowerCase().includes(normalizedQuery))
        : [];

    const hasResults = postResults.length > 0 || userResults.length > 0 || hashtagResults.length > 0;

    // END AI---------------------

    return (
        <div className="flex w-full flex-col gap-4">
            <SearchBar
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search posts, people, or hashtags..."
                autoFocus
            />

            {!query.trim() ? (
                null
            ) : hasResults ? (
                <div className="flex flex-col gap-6">
                    {userResults.length > 0 && (
                        <section className="space-y-3">
                            <h2 className="text-sm font-bold text-primary">Users</h2>
                            <div className="space-y-2">
                                {userResults.map((user) => (
                                    <Link
                                        key={user.username}
                                        href={`/@${user.username}`}
                                        className="flex items-start gap-3 rounded-md border-2 border-border bg-card-primary p-3 transition hover:border-primary/80"
                                    >
                                        <Image
                                            src={user.image}
                                            alt={user.name}
                                            width={42}
                                            height={42}
                                            unoptimized
                                            className="h-11 w-11 rounded-full object-cover"
                                        />
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-1">
                                                <span className="truncate text-sm font-semibold text-primary">
                                                    {user.name}
                                                </span>
                                                {user.verified && (
                                                    <BadgeCheck className="h-4 w-4 shrink-0 fill-primary text-background" />
                                                )}
                                                {user.role === "admin" && (
                                                    <Admin />
                                                )}
                                            </div>
                                            <p className="text-sm font-medium text-muted-foreground">
                                                @{user.username}
                                            </p>
                                            {user.bio && (
                                                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                                                    {user.bio}
                                                </p>
                                            )}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    {hashtagResults.length > 0 && (
                        <section className="space-y-3">
                            <h2 className="text-sm font-bold text-primary">#</h2>
                            <div className="space-y-2">
                                {hashtagResults.map((hashtag) => (
                                    <Link
                                        key={hashtag.tag}
                                        href={`/trending/${hashtag.tag}`}
                                        className="flex items-center justify-between rounded-md border-2 border-border bg-card-primary p-3 transition hover:border-primary/80"
                                    >
                                        <span className="flex items-center gap-2 font-semibold text-primary">
                                            <Hash className="h-4 w-4" strokeWidth={3} />
                                            {hashtag.tag}
                                        </span>
                                        <span className="text-sm text-muted-foreground">
                                            {hashtag.count.toLocaleString()} posts
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    {postResults.length > 0 && (
                        <section className="space-y-3">
                            <h2 className="text-sm font-bold text-primary">Posts</h2>
                            <PostList posts={postResults} />
                        </section>
                    )}
                </div>
            ) : (
                <p className="text-sm text-muted-foreground">
                    No results found.
                </p>
            )}
        </div>
    );
}
