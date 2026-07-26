import { getSession } from "@/server/auth"
import { NextRequest } from "next/server"
import { prisma } from "@/server/prisma"
import { Unauthorized, BadRequest, Success, Forbidden } from "@/lib/responses"

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getSession();
    if (!session) {
        return Unauthorized();
    }

    const { id } = await params;

    return Success(await prisma.shopSuggestionVote.findMany({
        where: {
            suggestionId: id
        },
        select: {
            id: true,
            userId: true,
            createdAt: true,
            updatedAt: true
        }
    }));
}