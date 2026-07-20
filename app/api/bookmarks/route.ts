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

// Libraries
import { getSession } from "@/server/auth"
import { NextResponse } from "next/server"
import { fetchBookmarks } from "@/server/bookmarks"

export async function GET() {
    const session = await getSession()

    if (!session) {
        return NextResponse.json(
            {
                code: 401,
                success: false,
                message: "Unauthorized",
            },
            { status: 401, }
        )
    }

    const bookmarks = await fetchBookmarks({
        userId: session.user.id,
    })

    return NextResponse.json(
        {
            code: 200,
            success: true,
            bookmarks
        },
        { status: 200 }
    )
}
