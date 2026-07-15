import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/server/auth";
import axios from "axios"
import { XMLParser } from "fast-xml-parser"

export async function GET(req: NextRequest) {
    const session = await getSession();

    if (!session) {
        return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
        });
    }

    try {
        const res = axios.get("https://www.abc.net.au/news/feed/51120/rss.xml")
        const p = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: "@_",
        })
        const parsedData = p.parse((await res).data)

        return NextResponse.json({ parsedData })
    } catch {
        return NextResponse.json({
            error: "Internal Server Error"
        }, {
            status: 500
        })
    }
}