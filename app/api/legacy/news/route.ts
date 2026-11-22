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

import axios from "axios"
import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/server/auth"
import { XMLParser } from "fast-xml-parser"

export async function GET(_req: NextRequest) {
    const session = await getSession()

    if (!session) {
        return NextResponse.json(
            {
                code: 401,
                success: false,
                message: "Unauthorized",
            },
            {
                status: 401,
            }
        )
    }

    try {
        const res = axios.get("https://www.abc.net.au/news/feed/51120/rss.xml") // national category rss.

        // parse
        const p = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: "@_",
        })

        // cool
        const parsedData = p.parse((await res).data)

        return NextResponse.json({ parsedData })
    } catch {
        return NextResponse.json(
            {
                code: 500,
                success: false,
                message: "Internal Server Error",
            },
            {
                status: 500,
            }
        )
    }
}
