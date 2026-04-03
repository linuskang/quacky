// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

import { format, formatDistanceToNow, differenceInDays } from 'date-fns';

// Timestamp human readable formatting for social media
export function formatTimestamp(createdAt?: string | Date) {
    if (!createdAt) return "just now";

    const date = new Date(createdAt);

    if (differenceInDays(new Date(), date) > 3) {
        return format(date, 'MMM d, yyyy');
    }

    return formatDistanceToNow(date, { addSuffix: true });
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
        const res = await fetch("/api/v1/posts");
        const data = await res.json();

        // return
        return data.posts as Post[]
    } catch (err) {
        console.log(err)

        return [];
    }
}
