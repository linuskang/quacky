import { NextResponse } from "next/server";

export function Unauthorized() {
    return NextResponse.json(
        {
            code: 401,
            success: false,
            message: "Unauthorized"
        },
        {
            status: 401
        }
    )
}

export function NotFound(message?: string) {
    return NextResponse.json(
        {
            code: 404,
            success: false,
            message: message ? message : "404 Not Found"
        },
        {
            status: 404
        }
    )
}


export function BadRequest(message?: string) {
    return NextResponse.json(
        {
            code: 400,
            success: false,
            message: message ? message : "Missing required fields"
        },
        {
            status: 400
        }
    )
}

export function Success(data?: unknown) {
    return NextResponse.json(
        {
            code: 200,
            success: true,
            data: data ? data : null
        },
        {
            status: 200
        }
    )
}

export function Forbidden(message?: string) {
    return NextResponse.json(
        {
            code: 403,
            success: false,
            message: message ? message : "You do not have permission to use this resource"
        },
        {
            status: 403
        }
    )
}