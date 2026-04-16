// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, UserCheck, Loader2 } from "lucide-react";

interface Props {
    handle: string;
    initialFollowing?: boolean;
}

export default function FollowButton({ handle, initialFollowing }: Props) {
    const [following, setFollowing] = useState(initialFollowing ?? null);
    const [loading, setLoading] = useState(initialFollowing === undefined);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        if (initialFollowing !== undefined) return;
        fetch(`/api/v1/users/${handle}/follow`)
            .then((r) => r.json())
            .then((d) => setFollowing(d.following ?? false))
            .catch(() => setFollowing(false))
            .finally(() => setLoading(false));
    }, [handle, initialFollowing]);

    async function toggle() {
        if (busy || following === null) return;
        setBusy(true);
        const next = !following;
        setFollowing(next);
        try {
            const endpoint = next ? "follow" : "unfollow";
            const res = await fetch(`/api/v1/users/${handle}/${endpoint}`, { method: "POST" });
            if (!res.ok) setFollowing(!next);
        } catch {
            setFollowing(!next);
        } finally {
            setBusy(false);
        }
    }

    if (loading) {
        return (
            <Button variant="outline" className="rounded-full font-bold min-w-[100px]" disabled>
                <Loader2 size={14} className="animate-spin" />
            </Button>
        );
    }

    return (
        <Button
            variant={following ? "outline" : "default"}
            className="rounded-full font-bold min-w-[100px] cursor-pointer gap-1.5"
            onClick={toggle}
            disabled={busy}
        >
            {following ? (
                <>
                    <UserCheck size={15} />
                    Following
                </>
            ) : (
                <>
                    <UserPlus size={15} />
                    Follow
                </>
            )}
        </Button>
    );
}
