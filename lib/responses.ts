//   ______                                 __
//  /      \                               /  |
// /$$$$$$  | __    __   ______    _______ $$ |   __  __    __
// $$ |  $$ |/  |  /  | /      \  /       |$$ |  /  |/  |  /  |
// $$ |  $$ |$$ |  $$ | $$$$$$  |/$$$$$$$/ $$ |_/$$/ $$ |  $$ |
// $$ |_ $$ |$$ |  $$ | /    $$ |$$ |      $$   $$<  $$ |  $$ |
// $$ / \$$ |$$ \__$$ |/$$$$$$$ |$$ \_____ $$$$$$  \ $$ \__$$ |
// $$ $$ $$< $$    $$/ $$    $$ |$$       |$$ | $$  |$$    $$ |
//  $$$$$$  | $$$$$$/   $$$$$$$/  $$$$$$$/ $$/   $$/  $$$$$$$ |
//      $$$/                                         /  \__$$ |
//                                                   $$    $$/
//                                                    $$$$$$/
//
// Linus Kang, 2026
// Work is licensed under the CC BY-NC 4.0 license.

import { NextResponse } from "next/server"

// This is just a simple NextResponse Wrapper for all api requests.
// For any endpoints you wish to use in a custom implementation,
// refer to below.
//
// - linus

export class Response {
    static Unauthorized() {
        return NextResponse.json(
            {
                code: 401,
                success: false,
                message: "Unauthorized",
            },
            {
                status: 401,
            }
        )
    }

    static NotFound(message?: string) {
        return NextResponse.json(
            {
                code: 404,
                success: false,
                message: message ? message : "404 Not Found",
            },
            {
                status: 404,
            }
        )
    }

    static InternalServerError(message?: string) {
        return NextResponse.json(
            {
                code: 500,
                success: false,
                message: message ? message : "Internal Server Error",
            },
            {
                status: 500,
            }
        )
    }

    static BadRequest(message?: string) {
        return NextResponse.json(
            {
                code: 400,
                success: false,
                message: message ? message : "Missing required fields",
            },
            {
                status: 400,
            }
        )
    }

    static Success(data?: unknown) {
        return NextResponse.json(
            {
                code: 200,
                success: true,
                data: data ? data : null,
            },
            {
                status: 200,
            }
        )
    }

    static Forbidden(message?: string) {
        return NextResponse.json(
            {
                code: 403,
                success: false,
                message: message
                    ? message
                    : "You do not have permission to use this resource",
            },
            {
                status: 403,
            }
        )
    }
}
