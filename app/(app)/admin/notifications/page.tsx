//   ______                                 __
//  /      \                               /  |
// /$$$$$$  | __    __   ______    _______ $$ |   __  __    __
// $$ |  $$ |/  |  /  | /      \  /       |$$ |  /  |/  |  /  |
// $$ |  $$ |$$ |  $$ | $$$$$$  |/$$$$$$$/ $$ |_/$$/ $$ |  $$ |
// $$ |_ $$ |$$ |  $$ | /    $$ |$$ |      $$   $$<  $$ |  $$ |
// $$ / \$$ |$$ \\__$$ |/$$$$$$$ |$$ \\_____ $$$$$$  \ $$ \\__$$ |
// $$ $$ $$< $$    $$/ $$    $$ |$$       |$$ | $$  |$$    $$ |
//  $$$$$$  | $$$$$$/   $$$$$$$/  $$$$$$$/ $$/   $$/  $$$$$$$ |
//      $$$/                                         /  \__$$ |
//                                                   $$    $$/
//                                                    $$$$$$/
//
// Linus Kang, 2026
// Work is licensed under the CC BY-NC 4.0 license.

"use client"

import * as React from "react"
import Link from "next/link"
import { redirect } from "next/navigation"

import { authClient } from "@/client/auth"
import { PageLayout, PageCenter } from "@/components/page-layout"
import { Title, Description } from "@/components/text"
import { BroadcastNotificationCard } from "@/components/broadcast-notification-card"
import Loading from "../../loading"

const subscribe = () => () => {}

export default function AdminNotificationsPage() {
    const { data: session, isPending } = authClient.useSession()
    const hydrated = React.useSyncExternalStore(
        subscribe,
        () => true,
        () => false
    )

    if (!hydrated || isPending) return <Loading />

    if (!session) redirect("/auth/login")

    if (session.user.role !== "admin") {
        return (
            <PageLayout>
                <PageCenter>
                    <Title>Access Denied</Title>
                    <Description>
                        You do not have permission to access this page.
                    </Description>
                </PageCenter>
            </PageLayout>
        )
    }

    return (
        <PageLayout>
            <PageCenter className="max-w-6xl gap-6">
                <div>
                    <Link
                        href="/admin"
                        className="text-xs font-semibold text-muted-foreground hover:underline mb-2 inline-block"
                    >
                        &larr; Back to Admin Panel
                    </Link>
                    <Title>Broadcast Notifications</Title>
                </div>

                <BroadcastNotificationCard />
            </PageCenter>
        </PageLayout>
    )
}
