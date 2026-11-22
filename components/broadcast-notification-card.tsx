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
import { toast } from "sonner"
import { trpc } from "@/lib/trpc"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export function BroadcastNotificationCard() {
    const [userId, setUserId] = React.useState("quacky")
    const [content, setContent] = React.useState("")
    const utils = trpc.useUtils()

    const broadcastMutation = trpc.admin.broadcastNotification.useMutation({
        onSuccess: async (res) => {
            const count = res.count
            toast.success(
                count !== undefined
                    ? `Notification sent to ${count} account${count === 1 ? "" : "s"}.`
                    : "Notification sent successfully."
            )
            setContent("")
            await Promise.all([
                utils.me.get.invalidate(),
                utils.me.notifications.invalidate(),
            ])
        },
        onError: (err) => {
            toast.error(err.message || "Failed to send notification.")
        },
    })

    const sending = broadcastMutation.isPending

    function sendNotification(event: React.FormEvent) {
        event.preventDefault()
        if (!content.trim()) return

        broadcastMutation.mutate({
            userId: userId.trim() || "quacky",
            content: content.trim(),
        })
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Send notification to everyone</CardTitle>
                <CardDescription>
                    Send out a notification to everyone&apos;s accounts.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={sendNotification} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="user-id">User ID</Label>
                        <Input
                            id="user-id"
                            value={userId}
                            onChange={(e) => setUserId(e.target.value)}
                            placeholder="quacky"
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="notification-content">Message</Label>
                        <Textarea
                            id="notification-content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Type notification message..."
                            required
                        />
                    </div>

                    <Button type="submit" className="w-full" disabled={sending}>
                        {sending ? "Sending..." : "Send notification"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
