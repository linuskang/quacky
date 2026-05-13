import Config from "@/server/config";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";

export async function GET(request: NextRequest) {
    const session = await auth.api.getSession(request);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const info = await Config.get("meta");
    const canRegister = await Config.get("self_register");
    const rules = await Config.get("rules");

    return NextResponse.json({ ...info, canRegister, ...rules });
}