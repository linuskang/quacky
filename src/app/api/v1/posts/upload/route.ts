// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { uploadFile } from "@/server/utilities/storage";
import { env } from "@/env";

// Posting requirements
var maxAttachments = 3;
var maxFileMB = 10;
var maxImageMB = 5;
var maxVideoMB = 50;
var allowedFileTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "video/mp4",
    "video/webm",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];

export async function POST(request: NextRequest) {
    const session = await auth.api.getSession(request);

    if (!session) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const form = await request.formData();
    const file = form.get("file") as File | null;
    const existingCount = Number(form.get("existingCount") || 0);

    if (!file) {
        return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    if (existingCount < 0 || existingCount >= maxAttachments) {
        return NextResponse.json(
            { success: false, error: `A post can have at most ${maxAttachments} attachments` },
            { status: 400 }
        );
    }

    const mimeType = file.type || "application/octet-stream";

    if (!allowedFileTypes.includes(mimeType)) {
        return NextResponse.json({ success: false, error: "Unsupported file type" }, { status: 400 });
    }

    let kind: "image" | "video" | "file" = "file";
    let maxBytes = maxFileMB * 1024 * 1024;

    if (mimeType.startsWith("image/")) {
        kind = "image";
        maxBytes = maxImageMB * 1024 * 1024;
    } else if (mimeType.startsWith("video/")) {
        kind = "video";
        maxBytes = maxVideoMB * 1024 * 1024;
    }

    if (file.size > maxBytes) {
        return NextResponse.json({ success: false, error: "File is too large" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const baseName = (file.name || "file").trim().replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-");
    const safeName = baseName.slice(0, 120) || "file";
    const ext = safeName.includes(".") ? safeName.split(".").pop() : "bin";
    const key = `posts/${session.user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    try {
        await uploadFile(key, buffer, mimeType);
    } catch (error) {
        console.error("Failed to upload post attachment", error);
        return NextResponse.json(
            { success: false, error: "Upload failed" },
            { status: 500 }
        );
    }

    const endpoint = env.S3_ENDPOINT.replace(/\/+$/g, "");
    const bucket = env.S3_BUCKET_NAME.replace(/^\/+|\/+$/g, "");
    const encodedKey = key.split("/").map((segment) => encodeURIComponent(segment)).join("/");
    const baseUrl = endpoint.endsWith(`/${bucket}`) ? endpoint : `${endpoint}/${bucket}`;
    const url = `${baseUrl}/${encodedKey}`;

    return NextResponse.json({
        success: true,
        attachment: { key, url, name: safeName, mimeType, size: file.size, kind },
    });
}
