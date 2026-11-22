import { buildTrpcOpenApiDocument } from "@/server/api/openapi"

export function GET() {
    return Response.json(buildTrpcOpenApiDocument())
}
