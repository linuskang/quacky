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

// Utilities
import { getSession } from "@/server/auth"

import { getDebugData } from "@/server/debug"

import { Response } from "@/lib/responses"

export async function GET() {
    const session = await getSession()

    if (!session || session.user.role !== "admin") {
        return Response.Unauthorized()
    }

    if (!session.user.statsForNerds) {
        return Response.Forbidden(
            "To access this API, please enable 'Stats for Nerds' in your account settings"
        )
    }

    const res = await getDebugData()

    return Response.Success(res)
}
