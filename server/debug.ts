import "server-only"

import { version } from "@/lib/var"
import { prisma } from "@/server/prisma"

export async function getDebugData() {
    const startedAt = performance.now()
    const [users, posts, signedInUsers] = await Promise.all([
        prisma.user.count(),
        prisma.post.count(),
        prisma.session.count(),
    ])
    const serverMs = performance.now() - startedAt

    return {
        build: process.env.NEXT_PUBLIC_BUILD_ID ?? "development",
        database: {
            users,
            posts,
            queries: 3,
        },
        activity: {
            signedInUsers,
        },
        server: {
            responseTimeMs: Number(serverMs.toFixed(2)),
            uptimeSeconds: Math.floor(process.uptime()),
            memory: {
                usedMb: Math.round(
                    process.memoryUsage().heapUsed / 1024 / 1024
                ),
                totalMb: Math.round(
                    process.memoryUsage().heapTotal / 1024 / 1024
                ),
            },
            nodeVersion: process.version,
        },
        app: {
            version,
        },
        generatedAt: new Date().toISOString(),
    }
}
