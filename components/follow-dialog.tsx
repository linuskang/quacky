"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { BadgeCheck } from "lucide-react";
import { Admin } from "@/components/icons";
import { toast } from "sonner";
import type { User } from "@/types";
import { Button } from "@/components/ui/button";
import { DialogClose } from "@/components/ui/dialog";
import { playfairDisplay } from "@/app/layout";

type DialogType = "following" | "followers" | null;

type ApiResponse = {
    users: User[];
};

export function FollowCounts({
    handle,
    followingCount,
    followersCount,
}: {
    handle: string;
    followingCount: number;
    followersCount: number;
}) {
    const [open, setOpen] = useState<DialogType>(null);

    return (
        <>
            <p className="mt-0.5 text-sm text-muted-foreground">
                <button
                    onClick={() => setOpen("following")}
                    className="hover:underline"
                >
                    <span className="font-bold text-primary">{followingCount}</span> Following
                </button>
                <span className="mx-1.5">·</span>
                <button
                    onClick={() => setOpen("followers")}
                    className="hover:underline"
                >
                    <span className="font-bold text-primary">{followersCount}</span> Followers
                </button>
            </p>

            <FollowDialog
                handle={handle}
                type={open}
                onClose={() => setOpen(null)}
            />
        </>
    );
}

function FollowDialog({
    handle,
    type,
    onClose,
}: {
    handle: string;
    type: DialogType;
    onClose: () => void;
}) {
    const [search, setSearch] = useState("");
    const [data, setData] = useState<ApiResponse | null>(null);
    const [loading, setLoading] = useState(false);

    const isOpen = type !== null;
    const title = type === "following" ? "Following" : "Followers";
    const endpoint = type === "following" ? "following" : "followers";

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search.trim()) params.set("search", search.trim());

            const res = await fetch(`/api/user/${handle}/${endpoint}?${params.toString()}`);
            if (!res.ok) {
                toast.error(res.statusText)
            }
            const json = await res.json()
            setData(json);
        } catch {
            toast.error("something happened");
        } finally {
            setLoading(false);
        }
    }, [handle, type, endpoint, search]);

    useEffect(() => {
        if (isOpen) {
            fetchData();
        }
    }, [isOpen, fetchData]);

    return (
        <Dialog open={isOpen} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="bg-card-primary border-2 border-border w-full !max-w-md p-4 flex flex-col gap-3 max-h-[80vh] overflow-hidden" showCloseButton={false}>
                <DialogHeader>
                    <DialogTitle className={`text-4xl font-semibold ${playfairDisplay.className} text-primary`}
                        style={{ fontStyle: "italic" }}>{title}</DialogTitle>
                </DialogHeader>

                <div className="flex items-center gap-2">
                    <Input
                        placeholder="Search users..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && fetchData()}
                        className="flex-1 !bg-card border-2 border-border focus:!border-chart-3 !ring-0 h-8"
                    />
                </div>

                <div className="overflow-y-auto min-h-[200px] max-h-[400px]">
                    {loading && !data ? (
                        <p className="text-sm text-muted-foreground text-center py-8">Loading...</p>
                    ) : data?.users.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">
                            Nobody is here {":("}
                        </p>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {data?.users.map((user) => (
                                <Link
                                    key={user.username}
                                    href={`/@${user.username}`}
                                    onClick={onClose}
                                    className="flex items-center gap-3 rounded-md border-2 border-border bg-card-primary p-2 transition hover:border-primary/80"
                                >
                                    <Image
                                        src={user.image}
                                        alt={user.name}
                                        width={40}
                                        height={40}
                                        unoptimized
                                        className="h-10 w-10 rounded-full object-cover shrink-0"
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
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                <DialogClose asChild>
                    <Button
                        variant="default"
                        className="w-full bg-background border-border border-2 h-10 hover:bg-background hover:!border-primary text-primary text-lg"
                    >
                        Close
                    </Button>
                </DialogClose>
            </DialogContent>
        </Dialog>
    );
}
