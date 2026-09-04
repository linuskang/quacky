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

import webpush from 'web-push'
import { prisma } from '@/server/prisma'
import { env } from "@/env"

// lzy load
function setup() {
    webpush.setVapidDetails(
        env.VAPID_EMAIL.startsWith("mailto:")
            ? env.VAPID_EMAIL
            : `mailto:${env.VAPID_EMAIL}`,
        env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        env.VAPID_PRIVATE_KEY
    )
}

// v2
export async function send(userId: string, actorId: string, content: string) {


    const actor = await prisma.user.findUnique({
        where: {
            id: actorId,
        }
    })

    if (!actor) {
        return "Actor not found"
    }

    const res = await prisma.notification.create({
        data: {
            userId,
            actorId,
            content,
        }
    })

    sendPushNotification(userId, {
        title: actor.name + " from Quacky",
        body: content,
        url: `/notifications`,
    })

    return res
}

export async function sendPushNotification(
    userId: string,
    payload: {
        title: string,
        body: string,
        url?: string
    }
) {
    setup()

    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        }
    })

    if (!user) {
        return "User not found"
    }

    if (!user.pushNotificationsEnabled) {
        return "Push notifications disabled for user"
    }

    const subscriptions = await prisma.pushSubscription.findMany({
        where: { userId },
    })

    if (subscriptions.length === 0) {
        return "User is not subbed"
    }

    const body = JSON.stringify({
        title: payload.title,
        body: payload.body,
        icon: '/android-chrome-192x192.png',
        badge: '/android-chrome-192x192.png',
        url: payload.url,
    })

    const res = await Promise.allSettled(
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
    for (let i = 0; i < res.length; i++) {
        const result = res[i]
        if (!result) continue
        if (result.status === 'rejected') {
            await prisma.pushSubscription.delete({
                where: { id: subscriptions[i].id },
            })
            removed++
        }
    }

    return true
}
