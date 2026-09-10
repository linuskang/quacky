import { NextRequest, NextResponse } from "next/server"

import { env } from "@/env"
import { runSimulationTick } from "@/server/simulation"

function isAuthorized(request: NextRequest) {
    const secret = env.SIMULATION_SCHEDULER_SECRET
    return Boolean(
        secret && request.headers.get("authorization") === `Bearer ${secret}`
    )
}

async function handle(request: NextRequest) {
    if (!isAuthorized(request)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        return NextResponse.json(await runSimulationTick())
    } catch (error) {
        console.error("Simulation tick failed", error)
        return NextResponse.json(
            { error: "Simulation tick failed" },
            { status: 500 }
        )
    }
}

export async function GET(request: NextRequest) {
    return handle(request)
}

export async function POST(request: NextRequest) {
    return handle(request)
}
