type HttpMethod = "get" | "post" | "patch" | "delete"

type Schema = {
    type?: string | string[]
    format?: string
    enum?: string[]
    description?: string
    minimum?: number
    maximum?: number
    minLength?: number
    maxLength?: number
    items?: Schema
    properties?: Record<string, Schema>
    required?: string[]
    additionalProperties?: boolean | Schema
}

type Parameter = {
    name: string
    description?: string
    required?: boolean
    schema?: Schema
}

type Operation = {
    summary: string
    description?: string
    public?: boolean
    parameters?: Parameter[]
    body?: {
        contentType?: "application/json" | "multipart/form-data"
        properties?: Record<string, Schema>
        required?: string[]
        schema?: Schema
    }
    responses?: number[]
}

type Route = {
    path: string
    tag: string
    operations: Partial<Record<HttpMethod, Operation>>
}

const string = (description?: string): Schema => ({
    type: "string",
    description,
})
const integer = (description?: string): Schema => ({
    type: "integer",
    description,
})
const boolean = (description?: string): Schema => ({
    type: "boolean",
    description,
})

const routes: Route[] = [
    {
        path: "/api/admin/invite",
        tag: "Administration",
        operations: {
            post: {
                summary: "Invite a user",
                description:
                    "Creates an account and emails temporary credentials. Admin only.",
                body: {
                    properties: {
                        email: { type: "string", format: "email" },
                        role: { type: "string", enum: ["admin", "user"] },
                        displayName: string(),
                        username: string(),
                    },
                    required: ["email", "role", "displayName", "username"],
                },
                responses: [201, 400, 401],
            },
        },
    },
    {
        path: "/api/debug",
        tag: "Administration",
        operations: {
            get: {
                summary: "Get server debug data",
                responses: [200, 401, 403],
            },
        },
    },
    {
        path: "/api/stats",
        tag: "Administration",
        operations: {
            get: {
                summary: "Get organization check-in statistics",
                responses: [200, 401, 403],
            },
        },
    },
    {
        path: "/api/bookmarks",
        tag: "Posts",
        operations: {
            get: { summary: "List my bookmarked posts", responses: [200, 401] },
        },
    },
    {
        path: "/api/check-in",
        tag: "Check-ins",
        operations: {
            post: {
                summary: "Submit today's wellbeing check-in",
                body: {
                    properties: {
                        wellbeing: integer(),
                        happiness: integer(),
                        stress: integer(),
                        sleep: integer(),
                        energy: integer(),
                        assistance: boolean(),
                    },
                    required: [
                        "wellbeing",
                        "happiness",
                        "stress",
                        "sleep",
                        "energy",
                        "assistance",
                    ],
                },
                responses: [201, 400, 401],
            },
        },
    },
    {
        path: "/api/me",
        tag: "Users",
        operations: {
            get: {
                summary: "Get my dashboard state",
                responses: [200, 401, 404],
            },
        },
    },
    {
        path: "/api/meta",
        tag: "Public",
        operations: {
            get: {
                summary: "Get public organization metadata",
                public: true,
                responses: [200],
            },
        },
    },
    {
        path: "/api/notifications",
        tag: "Notifications",
        operations: {
            get: { summary: "List my notifications", responses: [200, 401] },
        },
    },
    {
        path: "/api/news",
        tag: "News",
        operations: {
            get: {
                summary: "Get the latest national news feed",
                responses: [200, 401, 500],
            },
        },
    },
    {
        path: "/api/comments/{id}",
        tag: "Comments",
        operations: {
            get: {
                summary: "Get a comment thread",
                responses: [200, 401, 404],
            },
            delete: {
                summary: "Delete a comment",
                responses: [200, 401, 403, 404],
            },
        },
    },
    {
        path: "/api/comments/{id}/report",
        tag: "Comments",
        operations: {
            post: {
                summary: "Report a comment",
                body: {
                    properties: { reason: string() },
                    required: ["reason"],
                },
                responses: [200, 400, 401, 404],
            },
        },
    },
    {
        path: "/api/dms",
        tag: "Direct messages",
        operations: {
            get: { summary: "List my conversations", responses: [200, 401] },
        },
    },
    {
        path: "/api/dms/{handle}",
        tag: "Direct messages",
        operations: {
            get: {
                summary: "List messages with a user",
                responses: [200, 400, 401, 404],
            },
            post: {
                summary: "Send a direct message",
                body: {
                    properties: {
                        message: {
                            type: "string",
                            minLength: 1,
                            maxLength: 1000,
                        },
                    },
                    required: ["message"],
                },
                responses: [201, 400, 401, 404],
            },
        },
    },
    {
        path: "/api/feedback-portal",
        tag: "Feedback",
        operations: {
            post: {
                summary: "Submit product feedback",
                body: {
                    properties: {
                        usability: integer(),
                        satisfaction: integer(),
                        recommend: integer(),
                        visual: integer(),
                        comments: string(),
                    },
                    required: [
                        "usability",
                        "satisfaction",
                        "recommend",
                        "visual",
                        "comments",
                    ],
                },
                responses: [200, 400, 401],
            },
        },
    },
    {
        path: "/api/fuzzy",
        tag: "Warm fuzzies",
        operations: {
            get: {
                summary: "List my received warm fuzzies",
                responses: [200, 401],
            },
            post: {
                summary: "Send a warm fuzzy",
                body: {
                    properties: { message: string(), receiverId: string() },
                    required: ["message", "receiverId"],
                },
                responses: [201, 400, 401, 403, 404],
            },
        },
    },
    {
        path: "/api/fuzzy/report",
        tag: "Warm fuzzies",
        operations: {
            post: {
                summary: "Report a warm fuzzy",
                body: {
                    properties: { id: string(), reason: string() },
                    required: ["id", "reason"],
                },
                responses: [200, 400, 401, 404],
            },
        },
    },
    {
        path: "/api/memes",
        tag: "Memes",
        operations: {
            get: { summary: "List memes", responses: [200, 401] },
            post: {
                summary: "Create a meme",
                body: {
                    properties: { image: { type: "string", format: "uri" } },
                    required: ["image"],
                },
                responses: [200, 400, 401],
            },
        },
    },
    {
        path: "/api/memes/{id}",
        tag: "Memes",
        operations: {
            get: { summary: "Get a meme", responses: [200, 401, 404] },
        },
    },
    {
        path: "/api/memes/{id}/vote",
        tag: "Memes",
        operations: {
            post: {
                summary: "Vote on a meme",
                body: {
                    properties: {
                        type: { type: "string", enum: ["UPVOTE", "DOWNVOTE"] },
                    },
                    required: ["type"],
                },
                responses: [200, 400, 401, 404],
            },
        },
    },
    {
        path: "/api/memes/{id}/report",
        tag: "Memes",
        operations: {
            post: {
                summary: "Report a meme",
                body: {
                    properties: { reason: string() },
                    required: ["reason"],
                },
                responses: [200, 400, 401, 404],
            },
        },
    },
    {
        path: "/api/posts",
        tag: "Posts",
        operations: {
            get: {
                summary: "List posts",
                parameters: [
                    {
                        name: "hashtag",
                        description: "Only return posts with this hashtag.",
                    },
                ],
                responses: [200, 401],
            },
            post: {
                summary: "Create a post",
                body: {
                    properties: {
                        content: {
                            type: "string",
                            minLength: 1,
                            maxLength: 400,
                        },
                        attachments: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    name: string(),
                                    url: { type: "string", format: "uri" },
                                    type: string(),
                                },
                                required: ["name", "url"],
                            },
                        },
                    },
                    required: ["content"],
                },
                responses: [201, 400, 401, 403],
            },
        },
    },
    {
        path: "/api/posts/{id}",
        tag: "Posts",
        operations: {
            get: { summary: "Get a post", responses: [200, 401, 404] },
            patch: {
                summary: "Edit a post",
                body: {
                    properties: { content: string() },
                    required: ["content"],
                },
                responses: [200, 400, 401, 403, 404],
            },
            delete: {
                summary: "Delete a post",
                responses: [200, 401, 403, 404],
            },
        },
    },
    {
        path: "/api/posts/{id}/bookmark",
        tag: "Posts",
        operations: {
            post: {
                summary: "Bookmark a post",
                responses: [201, 400, 401, 404],
            },
            delete: {
                summary: "Remove a bookmark",
                responses: [201, 401, 404],
            },
        },
    },
    {
        path: "/api/posts/{id}/comment",
        tag: "Comments",
        operations: {
            post: {
                summary: "Comment on a post",
                body: {
                    properties: {
                        content: {
                            type: "string",
                            minLength: 1,
                            maxLength: 100,
                        },
                    },
                    required: ["content"],
                },
                responses: [201, 400, 401, 404],
            },
        },
    },
    {
        path: "/api/posts/{id}/like",
        tag: "Posts",
        operations: {
            post: { summary: "Like a post", responses: [200, 401, 404] },
            delete: { summary: "Unlike a post", responses: [200, 401, 404] },
        },
    },
    {
        path: "/api/posts/{id}/report",
        tag: "Posts",
        operations: {
            post: {
                summary: "Report a post",
                body: {
                    properties: { reason: string() },
                    required: ["reason"],
                },
                responses: [200, 400, 401, 404],
            },
        },
    },
    ...(["following", "foryou", "popular"] as const).map((feed) => ({
        path: `/api/posts/${feed}`,
        tag: "Posts",
        operations: {
            get: {
                summary: `List ${feed === "foryou" ? "For You" : feed} posts`,
                responses: [200, 401],
            },
        },
    })),
    {
        path: "/api/posts/quote",
        tag: "Posts",
        operations: {
            post: {
                summary: "Quote a post",
                body: {
                    properties: { postId: string(), content: string() },
                    required: ["postId", "content"],
                },
                responses: [201, 400, 401, 404],
            },
        },
    },
    {
        path: "/api/posts/repost",
        tag: "Posts",
        operations: {
            post: {
                summary: "Repost a post",
                body: {
                    properties: { postId: string() },
                    required: ["postId"],
                },
                responses: [201, 400, 401, 404],
            },
        },
    },
    {
        path: "/api/quizes",
        tag: "Quizzes",
        operations: { get: { summary: "List quizzes", responses: [200, 401] } },
    },
    {
        path: "/api/quiz/{id}",
        tag: "Quizzes",
        operations: {
            get: { summary: "Get a quiz", responses: [200, 401, 404] },
            post: {
                summary: "Submit quiz answers",
                body: {
                    schema: {
                        type: "object",
                        additionalProperties: { type: ["string", "number"] },
                    },
                },
                responses: [200, 400, 401, 404],
            },
        },
    },
    {
        path: "/api/rng",
        tag: "Random number game",
        operations: {
            get: {
                summary: "Get my entry and rank",
                responses: [200, 401, 404],
            },
            post: {
                summary: "Generate today's random number",
                responses: [201, 400, 401, 500],
            },
        },
    },
    {
        path: "/api/rng/today",
        tag: "Random number game",
        operations: {
            get: { summary: "Get today's leaderboard", responses: [200, 401] },
        },
    },
    {
        path: "/api/shorts",
        tag: "Shorts",
        operations: {
            get: { summary: "List shorts", responses: [200, 401] },
            post: {
                summary: "Upload a short",
                body: {
                    contentType: "multipart/form-data",
                    properties: {
                        video: { type: "string", format: "binary" },
                        description: string(),
                    },
                    required: ["video", "description"],
                },
                responses: [200, 400, 401],
            },
        },
    },
    {
        path: "/api/shorts/{id}",
        tag: "Shorts",
        operations: {
            get: { summary: "Get a short", responses: [200, 401, 404] },
        },
    },
    {
        path: "/api/shorts/{id}/report",
        tag: "Shorts",
        operations: {
            post: {
                summary: "Report a short",
                body: {
                    properties: { reason: string() },
                    required: ["reason"],
                },
                responses: [200, 400, 401, 404],
            },
        },
    },
    {
        path: "/api/shop",
        tag: "Shop",
        operations: {
            get: { summary: "List available shop items", responses: [200] },
            post: {
                summary: "Create a shop item",
                description: "Admin only.",
                body: {
                    properties: {
                        name: string(),
                        description: string(),
                        price: integer(),
                        available: boolean(),
                        category: string(),
                        featured: boolean(),
                        stock: integer(),
                        imageUrl: { type: "string", format: "uri" },
                    },
                    required: [
                        "name",
                        "description",
                        "price",
                        "available",
                        "category",
                        "featured",
                        "stock",
                        "imageUrl",
                    ],
                },
                responses: [200],
            },
        },
    },
    {
        path: "/api/shop/{id}",
        tag: "Shop",
        operations: {
            get: { summary: "Get a shop item", responses: [200, 401, 404] },
            post: {
                summary: "Purchase a shop item",
                responses: [200, 401, 404],
            },
            patch: {
                summary: "Update a shop item",
                description: "Admin only. All body fields are optional.",
                body: {
                    properties: {
                        name: string(),
                        description: string(),
                        price: integer(),
                        available: boolean(),
                        category: string(),
                        featured: boolean(),
                        stock: integer(),
                        imageUrl: { type: "string", format: "uri" },
                    },
                },
                responses: [200],
            },
            delete: {
                summary: "Delete a shop item",
                description: "Admin only.",
                responses: [200],
            },
        },
    },
    {
        path: "/api/user/{handle}",
        tag: "Users",
        operations: {
            get: { summary: "Get a user profile", responses: [200, 401, 404] },
        },
    },
    {
        path: "/api/user/{handle}/follow",
        tag: "Users",
        operations: {
            post: { summary: "Follow a user", responses: [201, 400, 401, 404] },
            delete: { summary: "Unfollow a user", responses: [200, 401, 404] },
        },
    },
    ...(["followers", "following"] as const).map((kind) => ({
        path: `/api/user/{handle}/${kind}`,
        tag: "Users",
        operations: {
            get: {
                summary: `List a user's ${kind}`,
                public: true,
                parameters: [
                    {
                        name: "search",
                        description: "Filter by display name or username.",
                    },
                ],
                responses: [200, 403, 404],
            },
        },
    })),
    {
        path: "/api/user/{handle}/report",
        tag: "Users",
        operations: {
            post: {
                summary: "Report a user profile",
                body: {
                    properties: { reason: string() },
                    required: ["reason"],
                },
                responses: [201, 400, 401, 404],
            },
        },
    },
    {
        path: "/api/users/mentions",
        tag: "Users",
        operations: {
            get: {
                summary: "Search users for mention autocomplete",
                parameters: [
                    { name: "q", description: "Username search text." },
                ],
                responses: [200, 401],
            },
        },
    },
    {
        path: "/api/users/suggested",
        tag: "Users",
        operations: {
            get: { summary: "List suggested users", responses: [200, 401] },
        },
    },
    {
        path: "/api/upload",
        tag: "Uploads",
        operations: {
            post: {
                summary: "Upload a file",
                body: {
                    contentType: "multipart/form-data",
                    properties: { file: { type: "string", format: "binary" } },
                    required: ["file"],
                },
                responses: [200, 400, 401],
            },
        },
    },
    {
        path: "/api/trending",
        tag: "Public",
        operations: {
            get: {
                summary: "List trending hashtags",
                public: true,
                responses: [200],
            },
        },
    },
]

const responseDescriptions: Record<number, string> = {
    200: "Successful response",
    201: "Resource created",
    400: "Invalid request",
    401: "Authentication required",
    403: "Insufficient permissions",
    404: "Resource not found",
    500: "Server error",
}

function operationId(method: HttpMethod, path: string) {
    const name = path
        .replace(/^\/api\//, "")
        .replace(/[{}]/g, "")
        .split("/")
        .map((part, index) =>
            index === 0 ? part : part[0].toUpperCase() + part.slice(1)
        )
        .join("")
        .replace(/-/g, "")
    return `${method}${name[0].toUpperCase()}${name.slice(1)}`
}

const paths = Object.fromEntries(
    routes.map((route) => {
        const pathParameters = [...route.path.matchAll(/{([^}]+)}/g)].map(
            ([, name]) => ({
                name,
                in: "path",
                required: true,
                schema: { type: "string" },
            })
        )

        const operations = Object.fromEntries(
            Object.entries(route.operations).map(([method, operation]) => {
                const op = operation as Operation
                const queryParameters =
                    op.parameters?.map((parameter) => ({
                        ...parameter,
                        in: "query",
                        required: parameter.required ?? false,
                        schema: parameter.schema ?? { type: "string" },
                    })) ?? []
                const requestBody = op.body
                    ? {
                          required: true,
                          content: {
                              [op.body.contentType ?? "application/json"]: {
                                  schema: op.body.schema ?? {
                                      type: "object",
                                      properties: op.body.properties,
                                      required: op.body.required,
                                  },
                              },
                          },
                      }
                    : undefined

                return [
                    method,
                    {
                        operationId: operationId(
                            method as HttpMethod,
                            route.path
                        ),
                        tags: [route.tag],
                        summary: op.summary,
                        description: op.description,
                        security: op.public ? [] : [{ cookieAuth: [] }],
                        parameters: [...pathParameters, ...queryParameters],
                        requestBody,
                        responses: Object.fromEntries(
                            (op.responses ?? [200]).map((status) => [
                                status,
                                { description: responseDescriptions[status] },
                            ])
                        ),
                    },
                ]
            })
        )

        return [route.path, operations]
    })
)

export const openApiDocument = {
    openapi: "3.1.0",
    info: {
        title: "Quacky API",
        version: "0.2.0",
        description:
            "HTTP API for Quacky. Authentication endpoints under /api/auth are intentionally omitted.",
    },
    servers: [{ url: "/", description: "Current server" }],
    tags: [...new Set(routes.map((route) => route.tag))].map((name) => ({
        name,
    })),
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
} as const
