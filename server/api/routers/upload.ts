import path from "node:path"
import { TRPCError } from "@trpc/server"
import { z } from "zod"

import { protectedProcedure, router } from "@/server/api/trpc"
import {
    getPublicObjectUrl,
    getStorageKey,
    uploadObject,
} from "@/server/storage"

export const uploadRouter = router({
    file: protectedProcedure
        .meta({
            description:
                "Upload a file via multipart FormData (`file` field) and return its public storage URL.",
            contentType: "multipart/form-data",
        })
        .input(z.instanceof(FormData))
        .mutation(async ({ ctx, input }) => {
            const file = input.get("file")

            if (!(file instanceof File) || file.size === 0) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "File is required",
                })
            }

            const extension = path.extname(file.name).toLowerCase()
            const key = getStorageKey(
                ctx.session.user.id,
                "v2",
                `${crypto.randomUUID()}${extension}`
            )

            await uploadObject({
                key,
                body: Buffer.from(await file.arrayBuffer()),
                contentType: file.type,
            })

            return {
                name: file.name,
                type: file.type,
                key,
                url: getPublicObjectUrl(key),
            }
        }),
})
