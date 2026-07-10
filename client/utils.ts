//   ______                                 __
//  /      \                               /  |
// /$$$$$$  | __    __   ______    _______ $$ |   __  __    __
// $$ |  $$ |/  |  /  | /      \  /       |$$ |  /  |/  |  /  |
// $$ |  $$ |$$ |  $$ | $$$$$$  |/$$$$$$$/ $$ |_/$$/ $$ |  $$ |
// $$ |_ $$ |$$ |  $$ | /    $$ |$$ |      $$   $$<  $$ |  $$ |
// $$ / \$$ |$$ \__$$ |/$$$$$$$ |$$ \_____ $$$$$$  \ $$ \__$$ |
// $$ $$ $$< $$    $$/ $$    $$ |$$       |$$ | $$  |$$    $$ |
//  $$$$$$  | $$$$$$/   $$$$$$$/  $$$$$$$/ $$/   $$/  $$$$$$$ |
//      $$$/                                         /  \__$$ |
//                                                   $$    $$/
//                                                    $$$$$$/
//
// Linus Kang, 2026
// Work is licensed under the CC BY-NC 4.0 license.

export function formatTimeAgo(time: string) {
    if (!time) return "0s";

    const date = new Date(time);

    if (isNaN(date.getTime())) {
        return "0s";
    }

    const now = new Date();
    const diffInSeconds = Math.max(
        0,
        Math.floor((now.getTime() - date.getTime()) / 1000)
    );

    if (diffInSeconds < 60) {
        return `${diffInSeconds}s`;
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return `${diffInMinutes}m`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return `${diffInHours}h`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
        return `${diffInDays}d`;
    }

    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) {
        return `${diffInWeeks}w`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
        return `${diffInMonths}mo`;
    }

    const diffInYears = Math.floor(diffInDays / 365);
    return `${diffInYears}y`;
}

export function formatDate(time: string) {
    if (!time) return null;

    const date = new Date(time);

    if (isNaN(date.getTime())) {
        return null;
    }

    return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

import { useState, useEffect } from "react";

export function useTimeAgo(time: string) {
    const [formatted, setFormatted] = useState<string>("");

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFormatted(formatTimeAgo(time));
    }, [time]);

    return formatted;
}

export function useFormattedDate(time: string) {
    const [formatted, setFormatted] = useState<string>("");

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFormatted(formatDate(time) ?? "");
    }, [time]);

    return formatted;
}

export function getGreeting(time: Date, name: string) {
    const hour = new Date(time).getHours();

    if (hour < 12) {
        return `Good morning, ${name}!`;
    } else if (hour < 18) {
        return `Good afternoon, ${name}!`;
    } else {
        return `Good evening, ${name}!`;
    }
}
