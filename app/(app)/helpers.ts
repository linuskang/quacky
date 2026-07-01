import { Post } from "@/types";

export async function fetchRecentPosts(): Promise<Post[]> {
    const res = await fetch("/api/posts");

    if (!res.ok) {
        throw new Error(res.statusText);
    }

    return res.json();
}

export async function fetchPostsByHashtag(tag: string): Promise<Post[]> {
    const res = await fetch(`/api/posts?hashtag=${encodeURIComponent(tag)}`);

    if (!res.ok) {
        throw new Error(res.statusText);
    }

    return res.json();
}
