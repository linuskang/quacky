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

import { getSession } from "@/server/auth"
import { NextResponse } from "next/server"
import { getDebugData } from "@/server/debug"

export async function GET() {
    const session = await getSession()

    if (!session || session.user.role !== "admin") {
        return NextResponse.json({
            code: 401,
            success: false,
            message: "Unauthorized",
        }, {
            status: 401
        })
    }

    if (!session.user.statsForNerds) {
        return NextResponse.json(
            {
                code: 403,
                success: false,
                message: "To access this API, please enable 'Stats for Nerds' in your account settings",
            },
            { status: 403 }
        )
    }

    const res = await getDebugData()

    return NextResponse.json({
        code: 200,
        success: true,
        res,
    }, {
        status: 200
    })
}
