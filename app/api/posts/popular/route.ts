import { getSession } from "@/server/auth"
import { NextRequest, NextResponse } from "next/server"
import Algorithms from "@/server/algo/rankings"

export async function GET(req: NextRequest) {
    const session = await getSession()

    if (!session) {
        return new NextResponse(
            "Unauthorized",
            { status: 401 }
        )
    }

    const posts = await Algorithms.popular(session.user.id)

    return NextResponse.json(posts,
        { status: 200 }
    )
}