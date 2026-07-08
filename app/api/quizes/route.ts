import { quizes } from "@/lib/var";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/server/auth";

export async function GET(req: NextRequest) {
    const session = await getSession();

    if (!session) {
        return new NextResponse(
            "Unauthorized",
            {
                status: 401
            }
        );
    }

    return NextResponse.json({
        quizes: quizes.map(({ questions, ...quiz }) => quiz),
    });
}