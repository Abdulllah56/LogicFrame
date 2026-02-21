'use client'

import { createClient } from '@/utils/supabase/client'
import { useState } from 'react'

type OAuthProvider = 'google' | 'github'

export default function OAuthSignIn() {
    const supabase = createClient()
    const [isPending, setIsPending] = useState(false)

    const handleLogin = async (provider: OAuthProvider) => {
        setIsPending(true)
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: `${location.origin}/auth/callback`,
                },
            })

            if (error) {
                console.error('OAuth error:', error)
            }
        } catch (error) {
            console.error('Login error:', error)
        } finally {
            setIsPending(false)
        }
    }

    return (
        <div className="space-y-3">
            <button
                type="button"
                onClick={() => handleLogin('google')}
                disabled={isPending}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 dark:bg-zinc-700 dark:border-zinc-600 dark:text-white dark:hover:bg-zinc-600"
            >
                <img
                    className="h-5 w-5 mr-2"
                    src="https://www.svgrepo.com/show/475656/google-color.svg"
                    alt="Google logo"
                />
                Sign in with Google
            </button>
            <button
                type="button"
                onClick={() => handleLogin('github')}
                disabled={isPending}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 dark:bg-zinc-700 dark:border-zinc-600 dark:text-white dark:hover:bg-zinc-600"
            >
                <img
                    className="h-5 w-5 mr-2"
                    src="https://www.svgrepo.com/show/512317/github-142.svg"
                    alt="GitHub logo"
                />
                Sign in with GitHub
            </button>
        </div>
    )
}
