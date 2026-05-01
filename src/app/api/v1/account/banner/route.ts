import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { uploadFile } from "@/server/utilities/storage";
import { env } from "@/env";
import prisma from "@/server/db";

export async function POST(request: NextRequest) {
    const session = await auth.api.getSession(request);

    if (!session) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
        return NextResponse.json(
            { error: "No file provided" },
            { status: 400 }
        );
    }

    if (!file.type.startsWith("image/")) {
        return NextResponse.json(
            { error: "File must be an image" },
            { status: 400 }
        );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const extension = file.name.split('.').pop() || file.type.split("/")[1] || "png";
    const fileName = `banners/${session.user.id}-${Date.now()}.${extension}`;

    await uploadFile(fileName, buffer, file.type);

    const bucketMatch = env.S3_BUCKET_NAME;
    const cdnDomain = `${env.S3_ENDPOINT}/${bucketMatch}`;

    const bannerUrl = `${cdnDomain}/${fileName}`;

    const updatedUser = await prisma.user.update(
        {
            where: {
                id: session.user.id,
            },
            data: {
                banner: bannerUrl,
            },
            select: {
                id: true,
                name: true,
                handle: true,
                bio: true,
                website: true,
                location: true,
                pronouns: true,
                banner: true,
                accentColor: true,
                image: true,
                privateAccount: true,
                emailNotif: true,
            }
        }
    );

    return NextResponse.json(
        { success: true, user: updatedUser },
        { status: 200 }
    );
}
