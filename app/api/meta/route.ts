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

import { env } from "@/env"
import { NextResponse } from "next/server"
import { version, rules } from "@/lib/var"
import { prisma } from "@/server/prisma"

export async function GET() {
    const posts = await prisma.post.count()
    const users = await prisma.user.count()

    return NextResponse.json({
        org: {
            name: env.ORG_NAME,
            description: env.DESCRIPTION,
            rules,
            loginBannerMsg: env.LOGIN_BANNER_MESSAGE,
        },
        version: version,
        stats: {
            posts,
            users,
        },
    })
}
