import { Up } from "@/server/upstream";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";

export async function GET(req: NextRequest) {
    const session = await auth.api.getSession({
        headers: req.headers
    })

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ message: "Hello from the feedback API!" });
}