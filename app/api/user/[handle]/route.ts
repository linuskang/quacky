import { prisma } from "@/server/prisma";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ handle: string }> }
) {
    const session = await auth.api.getSession({
        headers: req.headers,
    });

    if (!session) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    const { handle } = await params;

    const user = await prisma.user.findUnique(
        {
            where: {
                username: handle,
            }
        }
    )

    if (!user) {
        return NextResponse.json(
            { error: "User not found" },
            { status: 404 }
        );
    }

    if (user.banned) {

        return NextResponse.json(
            {
                id: user.id,
                name: user.name,
                username: user.username,
                banned: user.banned,
            }
        );
    }

    if (user.private) {
        return NextResponse.json(
            {
                id: user.id,
                name: user.name,
                username: user.username,
                image: user.image,
                createdAt: user.createdAt,
                verified: user.verified,
                private: user.private,
                role: user.role,
                banned: user.banned,
            },
            {
                status: 200,
            }
        )
    }

    return NextResponse.json(
        {
            id: user.id,
            name: user.name,
            username: user.username,
            image: user.image,
            createdAt: user.createdAt,
            verified: user.verified,
            private: user.private,
            role: user.role,
            bio: user.bio,
            website: user.website,
            location: user.location,
            bannerImage: user.bannerImage,
            pronouns: user.pronoun,
            banned: user.banned,
        },
        {
            status: 200,
        }
    )
}