import { z } from "zod"

import { version } from "@/lib/var"
import { appRouter } from "@/server/api/root"
import type { TRPCAuthTier, TRPCMeta } from "@/server/api/trpc"

type ProcedureDef = {
    type?: "query" | "mutation" | "subscription"
    meta?: TRPCMeta
    inputs?: unknown[]
}

type RuntimeProcedure = {
    _def?: ProcedureDef
}

const AUTH_LABELS: Record<TRPCAuthTier, string> = {
    public: "Public (no session required)",
    session: "Authenticated session required",
    admin: "Admin role required",
    "unlocked:posting": "Session + unlocked posting module required",
    "unlocked:commenting": "Session + unlocked commenting module required",
    "unlocked:dms": "Session + unlocked DMs module required",
    "unlocked:fuzzies": "Session + unlocked Warm Fuzzies module required",
    statsForNerds: "Session + 'Stats for Nerds' enabled required",
}

const TAG_NAMES: Record<string, string> = {
    meta: "Meta & Feeds",
    me: "Current User",
    posts: "Posts",
    comments: "Comments",
    users: "Users & Social",
    dms: "Direct Messages",
    fuzzies: "Warm Fuzzies",
    memes: "Memeland",
    shorts: "Shorts",
    quiz: "Quizzes",
    rng: "Daily RNG",
    shop: "Shop",
    upload: "Uploads",
    admin: "Administration",
    system: "System & Debug",
}

function toJsonSchema(input: unknown): Record<string, unknown> | null {
    if (!input || typeof input !== "object") return null

    try {
        const schema = z.toJSONSchema(input as z.ZodType, {
            unrepresentable: "any",
        }) as Record<string, unknown>
        delete schema.$schema
        return schema
    } catch {
        return null
    }
}

export function buildTrpcOpenApiDocument() {
    const procedures = appRouter._def.procedures as Record<
        string,
        RuntimeProcedure
    >

    const tagSet = new Set<string>()
    const paths: Record<string, Record<string, unknown>> = {}

    for (const [procPath, proc] of Object.entries(procedures)) {
        const def = proc._def
        if (!def || (def.type !== "query" && def.type !== "mutation")) {
            continue
        }

        const namespace = procPath.split(".")[0] ?? "general"
        const tag = TAG_NAMES[namespace] ?? namespace
        tagSet.add(tag)

        const meta = def.meta ?? {}
        const auth: TRPCAuthTier = meta.auth ?? "session"
        const isPublic = auth === "public"
        const isMultipart = meta.contentType === "multipart/form-data"
        const method = def.type === "query" ? "get" : "post"
        const httpPath = `/api/trpc/${procPath}`

        const inputSchema =
            def.inputs && def.inputs.length > 0
                ? toJsonSchema(def.inputs[0])
                : null

        const descriptionParts = [
            meta.description,
            `**Auth:** ${AUTH_LABELS[auth]}`,
            def.type === "query"
                ? "tRPC query procedure. Pass JSON-encoded input in the `input` query parameter."
                : isMultipart
                  ? "tRPC multipart mutation procedure. Submit `multipart/form-data` directly via POST."
                  : "tRPC mutation procedure. Submit JSON input in the request body.",
        ].filter(Boolean)

        const parameters =
            def.type === "query" && inputSchema
                ? [
                      {
                          name: "input",
                          in: "query",
                          required: false,
                          description:
                              "URL-encoded JSON input object matching the procedure's Zod schema.",
                          content: {
                              "application/json": {
                                  schema: inputSchema,
                              },
                          },
                      },
                  ]
                : []

        const requestBody =
            def.type === "mutation"
                ? isMultipart
                    ? {
                          required: true,
                          content: {
                              "multipart/form-data": {
                                  schema: {
                                      type: "object",
                                      additionalProperties: true,
                                      description:
                                          "Multipart FormData payload (e.g. `file` for upload.file or `video` + `description` for shorts.create).",
                                  },
                              },
                          },
                      }
                    : inputSchema
                      ? {
                            required: true,
                            content: {
                                "application/json": {
                                    schema: inputSchema,
                                },
                            },
                        }
                      : undefined
                : undefined

        const responses: Record<string, { description: string }> = {
            "200": {
                description:
                    "tRPC success envelope (`{ result: { data: ... } }`).",
            },
            "400": {
                description: "Validation or bad request error (`BAD_REQUEST`).",
            },
            ...(!isPublic
                ? {
                      "401": {
                          description:
                              "Authentication required (`UNAUTHORIZED`).",
                      },
                  }
                : {}),
            ...(auth === "admin" || auth.startsWith("unlocked:") || auth === "statsForNerds"
                ? {
                      "403": {
                          description: "Insufficient permissions (`FORBIDDEN`).",
                      },
                  }
                : {}),
        }

        paths[httpPath] = {
            [method]: {
                operationId: procPath,
                tags: [tag],
                summary: `${procPath} (${def.type})`,
                description: descriptionParts.join("\n\n"),
                security: isPublic ? [] : [{ cookieAuth: [] }],
                parameters,
                ...(requestBody ? { requestBody } : {}),
                responses,
            },
        }
    }

    return {
        openapi: "3.1.0",
        info: {
            title: "Quacky tRPC API",
            version,
            description:
                "Type-safe tRPC API for Quacky mounted at `/api/trpc`. Legacy REST endpoints remain available under `/api/legacy` (documented at `/api/legacy/docs`). Authentication endpoints live under `/api/auth`.",
        },
        servers: [{ url: "/", description: "Current server" }],
        tags: [...tagSet].map((name) => ({ name })),
        paths,
        components: {
            securitySchemes: {
                cookieAuth: {
                    type: "apiKey",
                    in: "cookie",
                    name: "better-auth.session_token",
                    description:
                        "Better Auth session cookie. The exact cookie prefix may vary by environment.",
                },
            },
        },
    }
}
