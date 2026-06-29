import { Post } from "@/types";

export async function fetchRecentPosts(): Promise<Post[]> {
    const res = await fetch("/api/posts");

    if (!res.ok) {
        throw new Error(res.statusText);
    }

    return res.json();
}