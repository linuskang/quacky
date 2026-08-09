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


// (c) 2026 Linus - github/linuskang/up

import webpush, { WebPushError } from 'web-push'
import { prisma } from '@/server/prisma'

let vapidConfigured = false
function setupWebPush() {
    if (vapidConfigured) return
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    const privateKey = process.env.VAPID_PRIVATE_KEY
    if (!publicKey || !privateKey) {
        console.error(
            "[push] VAPID keys missing (NEXT_PUBLIC_VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY); push notifications will fail"
        )
        return
    }
    webpush.setVapidDetails(
        "mailto:m@linus.id.au",
        publicKey,
        privateKey
    )
    vapidConfigured = true
}

export interface PushNotificationPayload {
    title?: string
    body: string
    icon?: string
}

export async function sendPushNotification(
    userId: string,
    payload: PushNotificationPayload
) {
    setupWebPush()
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        }
    })

    if (!user) {
        console.error(`[push] User not found: ${userId}`)
        return { success: false, error: 'User not found' }
    }

    if (!user.pushNotificationsEnabled) {
        console.error(`[push] Push notifications disabled for user: ${userId}`)
        return { success: false, error: 'Push notifications are disabled for this user' }
    }

    const subscriptions = await prisma.pushSubscription.findMany({
        where: { userId },
    })

    if (subscriptions.length === 0) {
        console.error(`[push] No push subscriptions for user: ${userId}`)
        return { success: false, error: 'No subscriptions found for user' }
    }

    const body = JSON.stringify({
        title: payload.title ?? 'Notification',
        body: payload.body,
        icon: payload.icon ?? '/android-chrome-192x192.png',
        badge: '/android-chrome-192x192.png',
    })

    const results = await Promise.allSettled(
        subscriptions.map((sub) =>
            webpush.sendNotification(
                {
                    endpoint: sub.endpoint,
                    keys: {
                        auth: sub.auth,
                        p256dh: sub.p256dh,
                    },
                },
                body
            )
        )
    )

    let removed = 0
    for (let i = 0; i < results.length; i++) {
        const result = results[i]
        if (!result) continue
        if (result.status === 'rejected') {
            const error = result.reason
            if (error instanceof WebPushError && (error.statusCode === 404 || error.statusCode === 410)) {
                const subscription = subscriptions[i]
                if (!subscription) continue
                await prisma.pushSubscription.delete({
                    where: { endpoint: subscription.endpoint },
                })
                removed++
            }
        }
    }

    return { success: true, sent: subscriptions.length - removed }
}