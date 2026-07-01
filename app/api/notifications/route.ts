import { NextResponse } from "next/server";
import { getSession } from "@/server/auth";
import { fetchNotifications } from "@/server/notifications";

export async function GET() {
    const session = await getSession()

    if (!session) {
        return NextResponse.json(
            {
                err: "Unauthorized",
            },
            {
                status: 401,
            }
        );
    }

    const notifications = await fetchNotifications({
        userId: session.user.id
    });

    return NextResponse.json(
        {
            notifications,
        },
        {
            status: 200,
        }
    );
}