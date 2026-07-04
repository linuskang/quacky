import { Up } from "@/server/upstream";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/server/auth";

export async function POST(req: NextRequest) {
    const session = await getSession()

    if (!session) {
        return NextResponse.json(
            {
                error: "Unauthorized"
            },
            {
                status: 401
            }
        );
    }

    const body = await req.json();

    if (!body || !body.usability || !body.satisfaction || !body.recommend || !body.visual || !body.comments) {
        return NextResponse.json(
            {
                error: "Invalid request body"
            },
            {
                status: 400
            }
        );
    }

    await Up.ingest(
        {
            title: `Feedback submitted from ${session.user.name} (${session.user.email})`,
            icon: "📋",
            category: "feedback",
            fields: [
                {
                    name: "Usability",
                    value: String(body.usability)
                },
                {
                    name: "Satisfaction",
                    value: String(body.satisfaction)
                },
                {
                    name: "Recommend",
                    value: String(body.recommend)
                },
                {
                    name: "Visual",
                    value: String(body.visual)
                },
            ],
            content: body.comments,
            data: [
                body,
                {
                    user: {
                        name: session.user.name,
                        email: session.user.email,
                        id: session.user.id,
                    }
                }
            ]
        }
    )

    return NextResponse.json(
        {
            message: "Feedback submitted successfully"
        },
        {
            status: 200
        }
    );
}