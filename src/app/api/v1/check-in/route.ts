import {auth} from "@/server/auth";
import {NextRequest, NextResponse} from "next/server";
import Config from '@/server/utilities/config';
import prisma from "@/server/db";

export async function GET(req: NextRequest) {
    const session = await auth.api.getSession(req);

    if (!session) {
        return NextResponse.json(
            {
                error: "Unauthorized",
            }
        )
    }

    try {
        const questions = await Config.get("checking_questions");

        return NextResponse.json(
            {
                questions: questions ?? [],
            }
        );
    }

    catch (err: any) {
        return NextResponse.json(
            {
                error: err.message,
            },
            {
                status: 500
            }
        )
    }
}

type QAnswers = {
    question: string;
    answer: string;
}

import Send from '@/server/utilities/email'

export async function POST(req: NextRequest) {
    const session = await auth.api.getSession(req);

    if (!session) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }

    try {
        const body = await req.json();
        const answers: QAnswers[] = body.answers;

        await prisma.checkInResponse.create(
            {
                data: {
                    userId: session.user.id,
                    answers,
                },
            }
        );

        // Custom question for QACI
        // Find if the custom question exists. In this case, if the question exists,
        // and the user selects Yes to wanting to talk to a staff,
        // Quacky will notify all Quacky user admins saying that the user needs to talk to staff in private.
        // From there, staff can reach out to the student via. email or by other means.

        const reqTalk = answers.find(
            (answer: QAnswers) => answer.question == "Do you need to talk to someone?"
        );

        if (reqTalk?.answer === "Yes") {
            const notifiers = await Config.get("staff_notifiers");

            if (!notifiers) {
                return NextResponse.json(
                    {
                        error: "No staff notifiers configured"
                    },
                    { status: 500 }
                );
            }

            Send(
                notifiers as unknown as string | string[],
                `${session.user.name} has requested to talk to a staff member`,
                `
                <p>Hello,</p>
                <p><strong>${session.user.name} (${session.user.email})</strong> has indicated they would like to talk to a staff member.</p>
                <p>Please reach out to them as soon as possible.</p>
                `
            )
        }

        return NextResponse.json(
            {
                success: true,
            },
            {
                status: 201
            }
        );

    }

    catch (err: any) {
        return NextResponse.json(
            {
                error: err.message,
            },
            {
                status: 500
            }
        );
    }
}
