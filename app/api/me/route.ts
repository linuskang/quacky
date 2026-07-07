import { getSession } from "@/server/auth";
import { hasCheckedIn } from "@/server/check-in";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const session = await getSession();

    if (!session) {
        return new NextResponse(
            "Unauthorized",
            {
                status: 401
            }
        );
    }

    const hasCheckedInToday = await hasCheckedIn(session.user.id);

    return NextResponse.json(
        {
            hasCheckedIn: hasCheckedInToday
        },
        {
            status: 200
        }
    );
}
