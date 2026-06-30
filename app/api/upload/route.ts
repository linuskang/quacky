import { auth } from "@/server/auth";
import { getPublicObjectUrl, getStorageKey, uploadObject } from "@/server/storage";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const session = await auth.api.getSession({
        headers: req.headers,
    });

    if (!session) {
        return NextResponse.json(
            {
                err: "Unauthorized",
            },
            {
                status: 401,
            }
        );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
        return NextResponse.json(
            {
                err: "File is required",
            },
            {
                status: 400,
            }
        );
    }

    const key = getStorageKey(
        session.user.id,
        `${crypto.randomUUID()}-${file.name}`
    );

    await uploadObject({
        key,
        body: Buffer.from(await file.arrayBuffer()),
        contentType: file.type || undefined,
    });

    return NextResponse.json({
        name: file.name,
        type: file.type || null,
        key,
        url: getPublicObjectUrl(key),
    });
}
