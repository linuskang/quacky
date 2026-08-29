import { NextResponse } from "next/server"
import type { NextFetchEvent, NextRequest } from "next/server"

import { flushLogs, logger } from "@/server/logger"

function formatBody(raw: string, contentType: string): unknown {
    try {
        return contentType.includes("json") ? JSON.parse(raw) : raw
    } catch {
        return raw
    }
}

async function readBody(req: NextRequest): Promise<unknown> {
    const contentType = req.headers.get("content-type") ?? ""

    const raw = await req.clone().text()
    return formatBody(raw, contentType)
}

export default async function proxy(req: NextRequest, event: NextFetchEvent) {
    const requestId = crypto.randomUUID()

    logger.info(
        {
            requestId,
            method: req.method.toUpperCase(),
            url: req.url,
            path: req.nextUrl.pathname,
            query: Object.fromEntries(req.nextUrl.searchParams),
            headers: Object.fromEntries(req.headers),
            body: await readBody(req),
        },
        `${req.method.toUpperCase()} ${req.nextUrl.pathname}-${requestId}`
    )

    event.waitUntil(flushLogs())

    return NextResponse.next({
        headers: {
            'x-request-id': requestId
        }
    })
}

export const config = {
    matcher: [
        "/api/:path*"
    ]
}
