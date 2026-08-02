import { Up } from "@/server/upstream"
import { prisma } from "@/server/prisma"
import { NextResponse } from "next/server"

export async function GET() {
    return NextResponse.json(await Up.ingest({
        title: "test",
        icon: "😄"
    }))
}