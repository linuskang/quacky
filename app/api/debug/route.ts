import { getSession } from "@/server/auth"
import { NextResponse } from "next/server"
import { getDebugData } from "@/server/debug"

export async function GET() {
    const session = await getSession()

    if (!session || session.user.role !== "admin") {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    return NextResponse.json(await getDebugData())
}
