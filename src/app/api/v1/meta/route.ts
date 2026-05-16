import Config from "@/server/utilities/config";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {

    const info = await Config.get("meta");
    const canRegister = await Config.get("self_register");
    const rules = await Config.get("rules");

    return NextResponse.json({ ...info, canRegister, ...rules });
}
