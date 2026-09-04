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

'use server'

import { PushSubscription } from 'web-push'
import { getSession } from '@/server/auth'
import { prisma } from '@/server/prisma'
import { sendPushNotification } from '@/server/notification'

export async function subscribeUser(sub: PushSubscription) {
    const session = await getSession()
    if (!session?.user?.id) {
        throw new Error('Not authenticated')
    }

    await prisma.pushSubscription.upsert({
        where: { endpoint: sub.endpoint },
        update: { userId: session.user.id },
        create: {
            userId: session.user.id,
            endpoint: sub.endpoint,
            auth: sub.keys.auth,
            p256dh: sub.keys.p256dh,
        },
    })

    return { success: true }
}

export async function unsubscribeUser(endpoint: string) {
    const session = await getSession()
    if (!session?.user?.id) {
        throw new Error('Not authenticated')
    }

    await prisma.pushSubscription.deleteMany({
        where: {
            endpoint,
            userId: session.user.id,
        },
    })

    return { success: true }
}

export async function sendNotificationToMe(message: string) {
    const session = await getSession()
    if (!session?.user?.id) {
        throw new Error('Not authenticated')
    }

    return sendPushNotification(session.user.id, {
        title: 'Quacky',
        body: message,
    })
}
