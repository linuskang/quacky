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
import Loading from "@/components/loading";

export default function Page() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchNotifications = async () => {
            setLoading(true);
            const res = await fetch("/api/notifications");
            if (!res.ok) {
                toast.error(res.statusText);
            }
            const data = await res.json();
            setNotifications(data.notifications);
            setLoading(false);
        }
        fetchNotifications();
    }, []);

    return (
        <PageLayout>
            <PageCenter>
                <h1 className="text-2xl font-semibold">Your Notifications</h1>
                {loading && <Loading />}
                <Notifications notifications={notifications} />
            </PageCenter>
            <PageRight>
                <SearchBar />
            </PageRight>
        </PageLayout>
    )
}