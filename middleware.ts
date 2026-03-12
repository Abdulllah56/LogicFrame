
import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
    // updateSession handles the session refresh logic and returns the updated user and response
    const { user, response } = await updateSession(request);

    // Protected Routes Pattern
    const protectedPaths = [
        '/dashboard',
    ];

    const isProtected = protectedPaths.some((path) =>
        request.nextUrl.pathname.startsWith(path)
    );

    if (isProtected && !user) {
        // When redirecting, we should stay consistent with the login path
        return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - auth (auth routes)
         */
        "/((?!_next/static|_next/image|favicon.ico|auth|api).*)",
    ],
};
