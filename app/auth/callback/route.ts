
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    const searchParams = requestUrl.searchParams
    const code = searchParams.get('code')

    // Robust origin detection to prevent 0.0.0.0 issues
    const getOrigin = () => {
        let url =
            process.env.NEXT_PUBLIC_SITE_URL ?? // Set this to your site URL in production env.
            process.env.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel.
            'http://localhost:5000'

        // Remove trailing slash if present for consistency
        url = url.endsWith('/') ? url.slice(0, -1) : url;

        // Ensure protocol
        if (!url.startsWith('http')) {
            url = `https://${url}`;
        }
        return url;
    }

    const origin = getOrigin();

    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get('next') ?? '/dashboard'

    if (code) {
        const cookieStore = await cookies()
        const supabase = createClient(cookieStore)
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            return NextResponse.redirect(`${origin}${next}`)
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
