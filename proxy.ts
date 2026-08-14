import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export default function proxy(req: NextRequest) {
    console.log("api")
}

export const config = {
    matcher: [
        "/api/:path*",
    ]
}