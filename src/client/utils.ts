// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

import { format, differenceInDays } from 'date-fns';

// Timestamp human readable formatting for social media
export function formatTimestamp(createdAt?: string | Date) {
    if (!createdAt) return "just now";

    const date = new Date(createdAt);

    if (Number.isNaN(date.getTime())) {
        return "just now";
    }

    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;

    if (differenceInDays(now, date) > 3) {
        return format(date, 'MMM d, yyyy');
    }

    const days = Math.floor(hours / 24);
    return `${days}d`;
}

// Format file sizes
export function formatSize(size: number) {
    if (size >= 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    if (size >= 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${size} B`;
};

// Get posts
import { Post } from "@/types";
export async function getPosts() {
    try {
        // fetch
        const res = await fetch("/api/v1/posts", { cache: "no-store" });
        const data = await res.json();

        // return
        return data.posts as Post[]
    } catch (err) {
        console.log(err)

        return [];
    }
}

// Get post

export async function getPost(postId: string): Promise<Post | null> {
    try {
        // fetch
        const res = await fetch(`/api/v1/posts/${postId}`, { cache: "no-store" });
        const data = await res.json();
        const post = data.post;

        // 404
        if (!post) {
            return null;
        }

        return post;

    } catch (err) {
        return null;
    }
}
