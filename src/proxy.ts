import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {

    // Log requests w/ IP
    if (process.env.NODE_ENV !== 'development') {
        const method = request.method;
        const url = request.url;
        const ip = request.headers.get('x-forwarded-for') || 'Unknown';

        console.log(`[${new Date().toISOString()}] ${method} ${url} from ${ip}`);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files like CSS/JS)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * * You usually want to exclude these so your console doesn't get spammed
         * every time a page loads its assets.
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
