
import Link from 'next/link'

export default function AuthErrorPage() {
    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 dark:bg-zinc-900 px-4">
            <div className="max-w-md w-full space-y-8 text-center">
                <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
                    Authentication Error
                </h2>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    There was a problem signing you in. The link may have expired or is invalid.
                </p>
                <div className="mt-5">
                    <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
                        Return to Login
                    </Link>
                </div>
            </div>
        </div>
    )
}
