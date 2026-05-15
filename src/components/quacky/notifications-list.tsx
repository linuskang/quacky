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

function getTimestamp(createdAt: string | Date) {
    return differenceInDays(new Date(), new Date(createdAt)) > 7
        ? format(new Date(createdAt), "MMM d, yyyy")
        : formatDistanceToNow(new Date(createdAt), { addSuffix: true });
}

function formatNotificationMessage(message: string) {
    return message.replace(/\\n/g, "\n");
}

export default function NotificationsList({ notifications, onMarkRead }: NotificationsListProps) {
    if (notifications.length === 0) {
        return (
            <div className="rounded-xl bg-card border border-border px-6 py-16 text-center">
                <Bell size={36} className="mx-auto mb-3 text-primary" />
                <p className="font-semibold text-primary">No notifications yet</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3">
            {notifications.map((notification) => {
                const isUnread = !notification.read;
                const timestamp = getTimestamp(notification.createdAt);

                return (
                    <div
                        key={notification.id}
                        className={`relative flex gap-3 rounded-xl border bg-card px-4 py-3.5 transition-colors ${
                            isUnread ? "border-primary/20 bg-primary/[0.04]" : "border-border"
                        }`}
                    >
                        {isUnread && (
                            <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary rounded-r-full" />
                        )}

                        {/* Content */}
                        <div className="flex-1 min-w-0 flex flex-col gap-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                                <div className="relative shrink-0">
                                    <Avatar className="w-8 h-8">
                                        <AvatarImage src={notification.actor.image || ""} alt={notification.actor.name} />
                                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                                            {notification.actor.name.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>

                                <Link
                                    href={`/${notification.actor.handle}`}
                                    className="font-bold text-sm text-foreground hover:underline leading-tight"
                                >
                                    {notification.actor.name}
                                </Link>

                                {notification.actor.verified && (
                                    <BadgeCheck
                                        className="text-primary -ml-0.5 shrink-0"
                                        size={10}
                                        fill="currentColor"
                                        stroke="var(--card)"
                                    />
                                )}

                                <span className="text-muted-foreground text-xs">
                                    @{notification.actor.handle}
                                </span>

                                <span className="text-muted-foreground text-xs">·</span>
                                <span className="text-muted-foreground text-xs whitespace-nowrap">{timestamp}</span>
                            </div>

                            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line break-words">
                                {formatNotificationMessage(notification.message)}
                            </p>

                            {notification.postId && (
                                <Link
                                    href={`/post/${notification.postId}`}
                                    className="text-xs text-primary hover:underline w-fit mt-0.5"
                                >
                                    View post
                                </Link>
                            )}
                        </div>

                        {isUnread && onMarkRead && (
                            <button
                                onClick={() => onMarkRead(notification.id)}
                                title="Mark as read"
                                className="shrink-0 self-start mt-1.5 p-1.5 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                            >
                                <Check size={13} />
                            </button>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
