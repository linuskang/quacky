import {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { env } from "@/env";

const s3Client = new S3Client(
    {
        region: env.S3_REGION,
        endpoint: env.S3_ENDPOINT,
        credentials: {
            accessKeyId: env.S3_ACCESS_KEY_ID,
            secretAccessKey: env.S3_SECRET_ACCESS_KEY,
        },

        forcePathStyle: true,
    }
);

const BUCKET_NAME = env.S3_BUCKET_NAME;

export async function uploadFile(
    fileName: string,
    fileBody: Buffer | Uint8Array | Blob | string,
    contentType: string
) {
    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: fileName,
        Body: fileBody,
        ContentType: contentType,
    });

    await s3Client.send(command);
    return fileName;
}

export async function deleteFile(fileName: string) {
    const command = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: fileName,
    });

    await s3Client.send(command);
    return true;
}

export default s3Client;
