"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { BadgeCheck } from "lucide-react";
import { Admin } from "@/components/icons";
import type { User } from "@/types";

type MentionUser = Omit<User, "role"> & {
    role: string | null;
};

type MentionMatch = {
    start: number;
    end: number;
    query: string;
};

function getMentionMatch(value: string, caret: number): MentionMatch | null {
    const beforeCaret = value.slice(0, caret);
    const match = beforeCaret.match(/(^|\s)@([a-zA-Z0-9_]*)$/);

    if (!match) return null;

    return {
        start: beforeCaret.length - match[2].length - 1,
        end: caret,
        query: match[2],
    };
}

export function useMentionSuggestions({
    value,
    caret,
    onChange,
    onCaretChange,
}: {
    value: string;
    caret: number;
    onChange: (value: string) => void;
    onCaretChange: (caret: number) => void;
}) {
    const [users, setUsers] = useState<MentionUser[]>([]);
    const match = getMentionMatch(value, caret);
    const active = Boolean(match);
    const query = match?.query ?? "";
    const visibleUsers = match ? users : [];
    const open = visibleUsers.length > 0;

    useEffect(() => {
        const controller = new AbortController();

        if (!active) {
            return;
        }

        async function fetchUsers() {
            const res = await fetch(`/api/users/mentions?q=${encodeURIComponent(query)}`, {
                signal: controller.signal,
            });

            if (!res.ok) {
                setUsers([]);
                return;
            }

            const data = await res.json() as { users?: MentionUser[] };
            setUsers(data.users ?? []);
        }

        fetchUsers().catch((error) => {
            if (error instanceof DOMException && error.name === "AbortError") return;
            setUsers([]);
        });

        return () => controller.abort();
    }, [active, query]);

    function selectUser(username: string) {
        if (!match) return;

        const mention = `@${username} `;
        const nextValue = `${value.slice(0, match.start)}${mention}${value.slice(match.end)}`;

        onChange(nextValue);
        onCaretChange(match.start + mention.length);
        setUsers([]);
    }

    return {
        open,
        users: visibleUsers,
        selectUser,
    };
}

export function MentionSuggestions({
    open,
    users,
    onSelect,
    className = "",
    positionClassName = "top-full mt-1",
}: {
    open: boolean;
    users: MentionUser[];
    onSelect: (username: string) => void;
    className?: string;
    positionClassName?: string;
}) {
    if (!open) return null;

    return (
        <div className={`absolute left-0 z-50 w-72 overflow-hidden rounded-md border-2 border-border bg-background shadow-sm ${positionClassName} ${className}`}>
            {users.map((user) => (
                <button
                    key={user.username}
                    type="button"
                    onMouseDown={(event) => {
                        event.preventDefault();
                        onSelect(user.username);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-primary/10"
                >
                    <Image
                        src={user.image}
                        alt={user.name}
                        width={28}
                        height={28}
                        unoptimized
                        className="h-7 w-7 rounded-full object-cover"
                    />
                    <span className="min-w-0 truncate text-sm font-semibold text-primary">
                        @{user.username}
                    </span>
                    {user.verified && (
                        <BadgeCheck className="h-4 w-4 shrink-0 fill-primary text-background" />
                    )}
                    {user.role === "admin" && (
                        <Admin />
                    )}
                    <span className="flex-1" />
                </button>
            ))}
        </div>
    );
}
