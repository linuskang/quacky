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

import { getSession } from "@/server/auth";
import { getCheckInSummary, hasCheckedIn } from "@/server/check-in";
import { NextResponse } from "next/server";
import { prisma } from "@/server/prisma";

export async function GET() {
    const session = await getSession();

    if (!session) {
        return new NextResponse(
            "Unauthorized",
            {
                status: 401
            }
        );
    }

    const [hasCheckedInToday, streak] = await Promise.all([
        hasCheckedIn(session.user.id),
        getCheckInSummary(session.user.id),
    ]);
    const canPost = await prisma.user.findUnique({
        where: {
            id: session.user.id
        },
        select: {
            unlockedPosting: true
        }
    })

    // type checking is weird man....
    // already declared that if the session isnt valid above
    // then return 401 but typescript is like "nah bro what if it is still null"
    // talk about redundant....
    if (!canPost) {
        return new NextResponse(
            "User not found",
            {
                status: 404
            }
        );
    }

    return NextResponse.json(
        {
            hasCheckedIn: hasCheckedInToday,
            canPost: canPost.unlockedPosting,
            streak,
        },
        {
            status: 200,
        }
    );
}
