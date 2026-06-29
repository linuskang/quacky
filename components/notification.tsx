"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { formatTimeAgo } from "@/client/utils";

// Types
import { Notification } from "@/types";
import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { Admin } from "./icons";
import { Markdown } from "./md";

export function Notifications(
    {
        notifications
    }: {
        notifications: Notification[]
    }
) {
    return (
        <div className="flex flex-col gap-2">
            {notifications.map((notification) => (
                <NotificationCard key={notification.id} notification={notification} />
            ))}
        </div>
    )
}

export function NotificationCard(
    {
        notification
    }: {
        notification: Notification
    }
) {

    const timeAgo = formatTimeAgo(notification.createdAt);

    return (
        <div className="rounded-md border-2 p-3 border-border max-w-lg w-full min-w-0 overflow-hidden !bg-card-primary">
            <div className="flex gap-2">
                <div className="shrink-0">
                    <Image
                        src={notification.actor.image}
                        alt={notification.actor.name}
                        width={28}
                        height={28}
                        unoptimized
                        className="rounded-full"
                    />
                </div>

                <div className="flex flex-col gap-1 min-w-0 flex-1 mb-0">
                    <div className="flex items-start justify-between min-w-0">
                        <div className="flex items-center gap-1 min-w-0 flex-wrap">
                            <Link
                                href={`/@${notification.actor.username}`}
                                className="text-primary font-semibold hover:underline"
                            >
                                {notification.actor.name}
                            </Link>

                            {notification.actor.verified && (
                                <BadgeCheck className="h-5 w-5 shrink-0 fill-primary text-background" />
                            )}

                            {notification.actor.role === "admin" && (
                                <Admin />
                            )}

                            <Link
                                href={`/@${notification.actor.username}`}
                                onClick={(event) => event.stopPropagation()}
                                className="text-sm text-muted-foreground font-semibold hover:underline"
                            >
                                @{notification.actor.username}
                            </Link>

                            <span className="text-sm text-muted-foreground">
                                · {timeAgo}
                            </span>
                        </div>
                    </div>
                    <Markdown>
                        {notification.content}
                    </Markdown>
                </div>
            </div>
        </div>
    )
}