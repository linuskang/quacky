const ICON = '/android-chrome-192x192.png'

self.addEventListener('push', function (event) {
    console.log('[SW] Push received', event)

    const showFallback = () =>
        self.registration.showNotification('Notification', {
            body: 'You have a new notification.',
            icon: ICON,
        })

    if (!event.data) {
        event.waitUntil(showFallback())
        return
    }

    event.waitUntil(
        (async () => {
            try {
                const data = event.data.json()
                const options = {
                    body: data.body,
                    icon: data.icon || ICON,
                    badge: ICON,
                    vibrate: [100, 50, 100],
                    data: {
                        dateOfArrival: Date.now(),
                        primaryKey: '2',
                    },
                }
                await self.registration.showNotification(
                    data.title || 'Notification',
                    options
                )
                console.log('[SW] Notification shown')
            } catch (error) {
                console.error('[SW] Failed to show notification:', error)
                await showFallback()
            }
        })()
    )
})

self.addEventListener('notificationclick', function (event) {
    console.log('[SW] Notification click received.')
    event.notification.close()

    event.waitUntil(
        (async () => {
            const url = new URL(self.location.origin)
            const windowClient = await self.clients.matchAll({
                type: 'window',
                includeUncontrolled: true,
            })

            const existing = windowClient.find((client) => client.url === url.href)
            if (existing) {
                await existing.focus()
                return
            }

            await self.clients.openWindow(url)
        })()
    )
})
