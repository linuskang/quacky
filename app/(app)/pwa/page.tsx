//   ______                                 __
//  /      \                               /  |
// /$$$$$$  | __    __   ______    _______ $$ |   __  __    __
// $$ |  $$ |/  |  /  | /      \  /       |$$ |  /  |/  |  /  |
// $$ |  $$ |$$ |  $$ | $$$$$$  |/$$$$$$$/ $$ |_/$$/ $$ |  $$ |
// $$ |_ $$ |$$ |  $$ | /    $$ |$$ |      $$   $$<  $$ |  $$ |
// $$ / \$$ |$$ \__$$ |/$$$$$$$ |$$ \_____ $$$$$$  \ $$ \__$$ |
// $$ $$ $$< $$    $$/ $$    $$ |$$       |$$ | $$  |$$    $$ |
//  $$$$$$  | $$$$$$/   $$$$$$$/  $$$$$$$/ $$/   $$/  $$$$$$$ |
//      $$$/                                         /  \__$$ |
//                                                   $$    $$/
//                                                    $$$$$$/
//
// Linus Kang, 2026
// Work is licensed under the CC BY-NC 4.0 license.

"use client"

// Libraries
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { authClient } from "@/client/auth"
import {
    subscribeUser,
    unsubscribeUser,
    sendNotificationToMe,
} from "@/components/pwa-actions"

// Components
import { CircleCheck, CircleX } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Title, Description } from "@/components/text"
import { PageLayout, PageCenter } from "@/components/page-layout"

interface BeforeInstallPromptEvent extends Event {
    prompt: () => void
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

declare global {
    interface Window {
        deferredInstallPrompt?: BeforeInstallPromptEvent
    }
}

function urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding)
        .replace(/-/g, "+")
        .replace(/_/g, "/")

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
}

export default function Page() {
    const { data: session } = authClient.useSession()
    const [subscription, setSubscription] = useState<PushSubscription | null>(
        null
    )
    const [installPrompt, setInstallPrompt] =
        useState<BeforeInstallPromptEvent | null>(
            () =>
                typeof window !== "undefined"
                    ? window.deferredInstallPrompt ?? null
                    : null
        )
    const [pushSupported] = useState(
        () =>
            typeof window !== "undefined" &&
            "serviceWorker" in navigator &&
            "PushManager" in window
    )

    useEffect(() => {
        if (!pushSupported) return

        let cancelled = false

        navigator.serviceWorker
            .register("/sw.js", {
                scope: "/",
                updateViaCache: "none",
            })
            .then((registration) => registration.pushManager.getSubscription())
            .then((sub) => {
                if (!cancelled) setSubscription(sub)
            })

        return () => {
            cancelled = true
        }
    }, [pushSupported])

    useEffect(() => {
        if (typeof window === "undefined") return

        const handler = (event: Event) => {
            event.preventDefault()
            setInstallPrompt(event as BeforeInstallPromptEvent)
        }

        window.addEventListener("beforeinstallprompt", handler)
        return () => window.removeEventListener("beforeinstallprompt", handler)
    }, [])

    if (!session) {
        return null
    }

    async function installApp() {
        if (!installPrompt) return

        installPrompt.prompt()

        const result = await installPrompt.userChoice

        if (result.outcome === "accepted") {
            toast.success("Quacky installed!")
        }

        setInstallPrompt(null)
        window.deferredInstallPrompt = undefined
    }

    async function subscribeToPush() {
        const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

        if (!publicKey) {
            toast.error("Push notifications aren't configured on this server.")
            return
        }

        try {
            const registration = await navigator.serviceWorker.ready
            const sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicKey),
            })
            const serializedSub = JSON.parse(JSON.stringify(sub))
            await subscribeUser(serializedSub)
            setSubscription(sub)
            toast.success("Push notifications enabled for this device.")
        } catch {
            toast.error("Failed to enable push notifications.")
        }
    }

    async function unsubscribeFromPush() {
        if (!subscription) return

        await subscription.unsubscribe()
        await unsubscribeUser(subscription.endpoint)
        setSubscription(null)
        toast.success("Push notifications disabled for this device.")
    }

    async function sendTestNotification() {
        try {
            await sendNotificationToMe("This is a test notification from Quacky!")
            toast.success("Test notification sent!")
        } catch {
            toast.error("Failed to send test notification.")
        }
    }

    return (
        <PageLayout>
            <PageCenter>
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <Title>PWA</Title>
                        <Description className="mt-1">
                            Install Quacky as an app and manage push
                            notifications.
                        </Description>
                    </div>
                </div>

                <Card className="bg-card-primary p-6">
                    <CardHeader className="p-0">
                        <CardTitle className="text-lg font-semibold text-primary">
                            Install Quacky
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="mt-2 p-0">
                        <p className="text-sm text-muted-foreground">
                            Install Quacky as a PWA so it feels like a native
                            app on your device.
                        </p>

                        <Button
                            variant="primary"
                            className="mt-4 rounded-full px-5 font-semibold"
                            onClick={installApp}
                            disabled={!installPrompt}
                        >
                            Install Quacky
                        </Button>

                        {!installPrompt && (
                            <p className="mt-2 text-sm text-muted-foreground">
                                Your browser doesn&apos;t support automatic
                                installs. Open this page in your browser menu
                                and use &quot;Add to Home Screen&quot; (or
                                &quot;Install app&quot;).
                            </p>
                        )}
                    </CardContent>
                </Card>

                <Card className="bg-card-primary p-6">
                    <CardHeader className="p-0">
                        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-primary">
                            {pushSupported ? (
                                <CircleCheck className="h-5 w-5 text-success" />
                            ) : (
                                <CircleX className="h-5 w-5 text-destructive" />
                            )}
                            Push Notifications
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="mt-2 space-y-4 p-0">
                        <p className="text-sm text-muted-foreground">
                            {pushSupported
                                ? "Push notifications are supported in this browser."
                                : "Push notifications are not supported in this browser."}
                        </p>

                        {pushSupported && (
                            <div className="space-y-3">
                                <p className="text-sm text-muted-foreground">
                                    {subscription
                                        ? "Notifications are enabled for this device."
                                        : "Notifications are disabled for this device."}
                                </p>

                                <div className="flex flex-wrap gap-2">
                                    {subscription ? (
                                        <>
                                            <Button
                                                variant="secondary"
                                                className="rounded-full px-4 font-semibold"
                                                onClick={sendTestNotification}
                                            >
                                                Send Test Notification
                                            </Button>
                                            <Button
                                                variant="default"
                                                className="rounded-full px-4 font-semibold"
                                                onClick={unsubscribeFromPush}
                                            >
                                                Disable
                                            </Button>
                                        </>
                                    ) : (
                                        <Button
                                            variant="primary"
                                            className="rounded-full px-4 font-semibold"
                                            onClick={subscribeToPush}
                                        >
                                            Enable Push Notifications
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="bg-card-primary p-6">
                    <CardHeader className="p-0">
                        <CardTitle className="text-lg font-semibold text-primary">
                            Account Notifications
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="mt-2 p-0">
                        <div className="flex items-center justify-between gap-4">
                            <p className="text-sm text-muted-foreground">
                                {session.user.pushNotificationsEnabled
                                    ? "Push notifications are enabled for your account."
                                    : "Push notifications are disabled for your account."}
                            </p>
                            <Switch
                                checked={
                                    session.user.pushNotificationsEnabled ??
                                    true
                                }
                                onCheckedChange={async (checked) => {
                                    try {
                                        await authClient.updateUser({
                                            pushNotificationsEnabled: checked,
                                        })
                                        toast.success(
                                            `Push notifications ${
                                                checked
                                                    ? "enabled"
                                                    : "disabled"
                                            } for your account.`
                                        )
                                    } catch {
                                        toast.error(
                                            "Failed to update push notification settings."
                                        )
                                    }
                                }}
                            />
                        </div>
                    </CardContent>
                </Card>
            </PageCenter>
        </PageLayout>
    )
}
