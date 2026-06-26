import { auth } from "@/server/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const session = await auth.api.getSession({
        headers: req.headers,
    })

    if (!session) {
        return NextResponse.json(
            {
                err: "Unauthorized",
            },
            {
                status: 401,
            }
        )
    }

    return NextResponse.json(
        {
            msg: "You are authenticated",
            user: session.user,
        },
        {
            status: 200,
        }
    )
}