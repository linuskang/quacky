// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

"use client";

import { redirect } from "next/navigation";
import { useState, useEffect } from "react";

import { authClient } from "@/client/auth";

import Sidebar from "@/components/quacky/sidebar";
import RightSidebar from "@/components/quacky/discover";
import NotificationsList from "@/components/quacky/notifications-list";
import type { NotificationItem } from "@/components/quacky/notifications-list";
import Loading from "@/components/loading";

export default function NotificationsPage() {
    const { data: session, isPending } = authClient.useSession();
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const unreadCount = notifications.filter((n) => !n.read).length;

    useEffect(() => {
        fetchNotifications();
    }, []);

    if (isPending) {
        return (
            <Loading />
        );
    }

    if (!session) {
        redirect("/signin");
    }

    async function fetchNotifications() {
        try {
            setLoading(true);
            const res = await fetch("/api/v1/notifications");
            const data = await res.json();

            setNotifications(data.notifications || []);

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const handleMarkRead = async (notificationId: string) => {
        try {
            const res = await fetch("/api/v1/notifications", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ notificationId }),
            });

            if (res.ok) {
                setNotifications((prev) =>
                    prev.map((n) =>
                        n.id === notificationId ? { ...n, read: true } : n
                    )
                );
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            const res = await fetch("/api/v1/notifications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "markAllRead" }),
            });

            if (res.ok) {
                setNotifications((prev) =>
                    prev.map((n) => ({ ...n, read: true }))
                );
            }
        } catch (error) {
            console.error("Failed to mark all as read:", error);
        }
    };

    if (isPending || (session && loading)) {
        return (
            <main className="min-h-screen w-full flex justify-center bg-background dark:bg-background">
                <div className="flex w-full max-w-[1200px] gap-4 px-4">
                    <Sidebar
                        session={session}
                    />
                    <div className="flex-1 flex flex-col pt-8 max-w-2xl">
                        <div className="mb-4 p-4">
                            <div className="flex items-center justify-between gap-3">
                                <h1 className="text-2xl font-bold text-primary">My Notifications</h1>

                            </div>
                            <div className="flex justify-center">
                                <Loading />
                            </div>
                        </div>
                    </div>
                    <RightSidebar
                        session={session}
                    />
                </div>
            </main>
        );
    }

    if (!session) {
        redirect("/signin");
    }

    return (
        <main className="min-h-screen w-full flex flex-col items-center bg-background dark:bg-background">
            <div className="flex w-full max-w-[1200px] flex-1 gap-4 px-4">
                <Sidebar
                    session={session}
                />

                <div className="flex-1 flex flex-col pt-8 max-w-2xl">
                    <div className="mb-4 p-4">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold text-primary">Notifications</h1>
                                {unreadCount > 0 && (
                                    <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-background">
                                        {unreadCount} unread
                                    </span>
                                )}
                            </div>
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllRead}
                                    className="text-xs font-bold text-primary hover:underline cursor-pointer"
                                >
                                    Mark all read
                                </button>
                            )}
                        </div>
                    </div>

                    <NotificationsList
                        notifications={notifications}
                        onMarkRead={handleMarkRead}
                        onMarkAllRead={handleMarkAllRead}
                    />
                </div>

                <RightSidebar
                    session={session}
                />
            </div>

            <footer className="w-full py-4 text-center text-xs text-muted-foreground">
                (c) Linus Kang 2026. All Rights Reserved.
            </footer>
        </main>
    );
}
