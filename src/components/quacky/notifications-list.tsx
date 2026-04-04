// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

"use client";

import Link from "next/link";
import { formatDistanceToNow, format, differenceInDays } from "date-fns";

import { BadgeCheck, Bell, Check } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export interface NotificationItem {
    id: string;
    type: string;
    message: string;
    read: boolean;
    createdAt: string | Date;
    actorId?: string | null;
    postId?: string;
    replyId?: string;
    actor: {
        id: string;
        name: string;
        handle: string;
        image?: string;
        verified: boolean;
    };
}

interface NotificationsListProps {
    notifications: NotificationItem[];
    onMarkRead?: (id: string) => void;
    onMarkAllRead?: () => void;
}

export default function NotificationsList({
    notifications,
    onMarkRead,
}: NotificationsListProps) {

    const getTimestamp = (createdAt: string | Date) => {
        return differenceInDays(new Date(), new Date(createdAt)) > 7
            ? format(new Date(createdAt), "MMM d, yyyy")
            : formatDistanceToNow(new Date(createdAt), { addSuffix: true });
    };

    if (notifications.length === 0) {
        return (
            <div className="rounded-xl bg-[var(--lynt)] border border-border p-12 text-center">
                <Bell size={48} fill="currentColor" className="mx-auto mb-4 text-primary" />
                <p className="text-lg font-bold text-primary">No notifications yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                    crickets...
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">

            <div className="flex flex-col gap-2">
                {notifications.map((notification) => {
                    const timestamp = getTimestamp(notification.createdAt);
                    const isUnread = !notification.read;

                    return (
                        <div
                            key={notification.id}
                            className={`rounded-xl border p-4 flex gap-3 transition-all duration-200 bg-[var(--lynt)] border-border`}
                        >
                            <div className="flex-1 min-w-0">

                                <div className="flex items-center gap-2 mb-2">

                                    <Avatar className="w-7 h-7 shrink-0">
                                        <AvatarImage
                                            src={notification.actor.image || ""}
                                            alt={
                                                notification.actor.name
                                            }
                                        />
                                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                            {notification.actor.name.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>

                                    <Link
                                        href={`/${notification.actor.handle}`}
                                        className="font-bold text-primary hover:underline text-sm"
                                    >
                                        {notification.actor.name}
                                    </Link>

                                    {notification.actor.verified && (
                                        <div className="p-0 -ml-1">
                                            <BadgeCheck
                                                className="text-primary"
                                                size={20}
                                                fill="currentColor"
                                                stroke="var(--lynt)"
                                            />
                                        </div>
                                    )}

                                    <span className="text-xs text-muted-foreground font-bold -ml-1">
                                        @{notification.actor.handle}
                                    </span>

                                </div>

                                <p className="text-sm text-primary font-medium leading-relaxed whitespace-pre-line">
                                    {notification.message}
                                </p>

                                {notification.postId && (
                                    <div className="mt-2 flex items-center gap-3">
                                        <p className="text-xs text-muted-foreground font-bold">{timestamp}</p>
                                        <Link href={`/post/${notification.postId}`} className="text-xs font-bold text-primary hover:underline">View post</Link>
                                    </div>
                                )}

                            </div>

                            {isUnread && onMarkRead && (
                                <button
                                    onClick={() => onMarkRead(notification.id)}
                                    className="mt-1 flex-shrink-0 rounded-md p-1 text-primary hover:bg-primary/10 transition-colors"
                                    title="Mark as read"
                                >
                                    <Check size={18} />
                                </button>
                            )}

                        </div>
                    );
                })}
            </div>
        </div>
    );
}
