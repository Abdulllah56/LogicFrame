
import { type NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
    const { supabase, response } = createClient(request);

    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Protected Routes Pattern
    // Adjust this pattern to match your app's structure
    const protectedPaths = [
        '/dashboard',
        '/financefriend',
        '/scopecreep',
        '/invoicechase',
        '/invoicemaker',
        '/Object-Extractor',
        '/screenshotbeautifier',
    ];

    const isProtected = protectedPaths.some((path) =>
        request.nextUrl.pathname.startsWith(path)
    );

    if (isProtected && !user) {
        return Response.redirect(new URL("/auth/login", request.url));
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
         * Feel free to modify this pattern to include more paths.
         */
        "/((?!_next/static|_next/image|favicon.ico|auth|api).*)",
    ],
};
