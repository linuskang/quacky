import {
    DeleteObjectCommand,
    GetObjectCommand,
    HeadObjectCommand,
    PutObjectCommand,
    S3Client,
} from "@aws-sdk/client-s3";
import { env } from "@/env";

const storage = new S3Client({
    endpoint: env.RUSTFS_ENDPOINT,
    region: env.RUSTFS_REGION,
    forcePathStyle: true,
    credentials: {
        accessKeyId: env.RUSTFS_ACCESS_KEY_ID,
        secretAccessKey: env.RUSTFS_SECRET_ACCESS_KEY,
    },
});

export type UploadObjectInput = {
    key: string;
    body: PutObjectCommand["input"]["Body"];
    contentType?: string;
    cacheControl?: string;
};

export function getStorageKey(...parts: string[]) {
    return parts
        .map((part) => part.replace(/^\/+|\/+$/g, ""))
        .filter(Boolean)
        .join("/");
}

export function getPublicObjectUrl(key: string) {
    const baseUrl = env.RUSTFS_PUBLIC_BASE_URL.replace(/\/+$/g, "");
    const objectKey = key.replace(/^\/+/, "");

    return `${baseUrl}/${objectKey}`;
}

export async function uploadObject({
    key,
    body,
    contentType,
    cacheControl = "public, max-age=31536000, immutable",
}: UploadObjectInput) {
    await storage.send(
        new PutObjectCommand({
            Bucket: env.RUSTFS_BUCKET,
            Key: key,
            Body: body,
            ContentType: contentType,
            CacheControl: cacheControl,
        })
    );

    return {
        key,
        url: getPublicObjectUrl(key),
    };
}

export async function getObject(key: string) {
    return storage.send(
        new GetObjectCommand({
            Bucket: env.RUSTFS_BUCKET,
            Key: key,
        })
    );
}

export async function objectExists(key: string) {
    try {
        await storage.send(
            new HeadObjectCommand({
                Bucket: env.RUSTFS_BUCKET,
                Key: key,
            })
        );

        return true;
    } catch {
        return false;
    }
}

export async function deleteObject(key: string) {
    await storage.send(
        new DeleteObjectCommand({
            Bucket: env.RUSTFS_BUCKET,
            Key: key,
        })
    );
}

export { storage };
