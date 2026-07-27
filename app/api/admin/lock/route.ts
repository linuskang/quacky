import { NextRequest } from "next/server";
import { prisma } from "@/server/prisma"
import { getSession } from "@/server/auth"
import { Success, Forbidden, Unauthorized } from "@/lib/responses"
import { Up } from "@/server/upstream"

export async function POST(req: NextRequest) {
    const sess = await getSession()
    if (!sess) {
        return Unauthorized()
    }

    if (sess.user.role !== "admin") {
        return Forbidden()
    }

    const body = await req.json() as {
        locked: boolean
    }

    // make a function here to lock functions like dms, posting, commenting, fuzzies, etc.

    await Up.ingest({
        title: "Site features restrictions updated",
        icon: body.locked ? "🔒" : "🔓",
        fields: [
            {
                name: "Locked",
                value: body.locked ? "Yes" : "No"
            },
            {
                name: "Updated by",
                value: sess.user.email
            }
        ],
        data: {
            sess
        }
    })

    return Success({
        locked: body.locked
    })
}