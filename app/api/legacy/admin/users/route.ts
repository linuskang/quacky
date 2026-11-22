import { getSession } from "@/server/auth"
import { getUsers } from "@/server/users"
import { Response } from "@/lib/responses"

export async function GET() {
    const session = await getSession()

    if (!session) return Response.Unauthorized()
    if (session.user.role !== "admin") return Response.Forbidden()

    return Response.Success(await getUsers())
}