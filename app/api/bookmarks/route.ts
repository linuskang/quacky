import { getSession } from "@/server/auth";
import { NextResponse } from "next/server";
import { fetchBookmarks } from "@/server/bookmarks";

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
        )
    }

    const bookmarks = await fetchBookmarks({
        userId: session.user.id
    });

    return NextResponse.json(bookmarks);
}