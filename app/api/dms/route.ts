import { getSession } from "@/server/auth";
import { fetchConversations } from "@/server/dms";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await getSession();

    if (!session) {
        return NextResponse.json(
            { err: "Unauthorized" },
            { status: 401 }
        );
    }

    const conversations = await fetchConversations({
        userId: session.user.id,
    });

    return NextResponse.json(conversations);
}