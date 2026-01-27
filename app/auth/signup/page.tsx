
'use client'

import { signup } from '../actions'
import Link from 'next/link'
import { useActionState } from 'react'

const initialState = {
    error: '',
    message: '',
}

export default function SignupPage() {
    // @ts-ignore
    const [state, formAction, isPending] = useActionState(signup, initialState)

    return (
        <div className="bg-white dark:bg-zinc-800 py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-200 dark:border-zinc-700">
            <div className="sm:mx-auto sm:w-full sm:max-w-md mb-6">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                    Create your account
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                    Already have an account?{' '}
                    <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
                        Sign in
                    </Link>
                </p>
            </div>

            <form action={formAction} className="space-y-6">
                <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                        Full Name
                    </label>
                    <div className="mt-1">
                        <input
                            id="fullName"
                            name="fullName"
                            type="text"
                            autoComplete="name"
                            required
                            className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-zinc-700 dark:text-white"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                        Email address
                    </label>
                    <div className="mt-1">
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-zinc-700 dark:text-white"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                        Password
                    </label>
                    <div className="mt-1">
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="new-password"
                            required
                            className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-zinc-700 dark:text-white"
                        />
                    </div>
                </div>

                {state?.error && (
                    <div className="text-red-500 text-sm mt-2">
                        {state.error}
                    </div>
                )}

                {state?.message && (
                    <div className="text-green-500 text-sm mt-2">
                        {state.message}
                    </div>
                )}

                <div>
                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        {isPending ? 'Signing up...' : 'Sign up'}
                    </button>
                </div>
            </form>
        </div>
    )
}
