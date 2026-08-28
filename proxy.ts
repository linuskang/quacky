import { NextResponse } from "next/server"
import type { NextFetchEvent, NextRequest } from "next/server"

import { flushLogs, logger } from "@/server/logger"

const MAX_BODY_CHARACTERS = 10_000
const MAX_BODY_BYTES = 1_000_000
const TEXTUAL_CONTENT_TYPES = [
    "application/json",
    "application/xml",
    "application/x-www-form-urlencoded",
    "text/",
]

function formatBody(raw: string, contentType: string): unknown {
    if (raw.length > MAX_BODY_CHARACTERS) {
        return `${raw.slice(0, MAX_BODY_CHARACTERS)}… [truncated, ${raw.length} chars total]`
    }
    if (contentType.includes("json")) {
        try {
            return JSON.parse(raw)
        } catch {
            return raw
        }
    }
    return raw
}

export default async function proxy(req: NextRequest, event: NextFetchEvent) {
    const requestId = crypto.randomUUID()

    const method = req.method.toUpperCase()
    const contentType = req.headers.get("content-type") ?? ""
    const contentLength = Number(req.headers.get("content-length") ?? 0)

    let body: unknown
    if (method !== "GET" && method !== "HEAD") {
        if (contentLength > MAX_BODY_BYTES) {
            body = `[skipped: body too large (${contentLength} bytes)]`
        } else if (
            TEXTUAL_CONTENT_TYPES.some((type) => contentType.includes(type))
        ) {
            // Clone so the original body remains intact for the route handler
            body = formatBody(await req.clone().text(), contentType)
        } else if (contentType) {
            body = `[skipped: non-textual content-type ${contentType}]`
        }
    }

    logger.info(
        {
            requestId,
            method,
            url: req.url,
            path: req.nextUrl.pathname,
            query: Object.fromEntries(req.nextUrl.searchParams),
            headers: Object.fromEntries(req.headers),
            body,
        },
        "api request"
    )

    event.waitUntil(flushLogs())

    const requestHeaders = new Headers(req.headers)
    requestHeaders.set("x-request-id", requestId)

    return NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    })
}

export const config = {
    matcher: ["/api/:path*"],
}
