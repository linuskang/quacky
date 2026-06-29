"use client";

// Libraries
import { useState, useEffect } from "react";
import { toast } from "sonner";

// Components
import { PageLayout, PageCenter, PageRight } from "@/components/page-layout";
import { SearchBar } from "@/components/search-bar";
import { Notifications } from "@/components/notification";

// Types
import { Notification } from "@/types";

export default function Page() {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        const fetchNotifications = async () => {
            const res = await fetch("/api/notifications");
            if (!res.ok) {
                toast.error(res.statusText);
            }
            const data = await res.json();
            setNotifications(data.notifications);
        }
        fetchNotifications();
    }, []);

    return (
        <PageLayout>
            <PageCenter>
                <h1 className="text-2xl font-semibold">Your Notifications</h1>
                <Notifications notifications={notifications} />
            </PageCenter>
            <PageRight>
                <SearchBar />
            </PageRight>
        </PageLayout>
    )
}