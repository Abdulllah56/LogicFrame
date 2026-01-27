
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { headers, cookies } from 'next/headers'

export async function login(prevState: any, formData: FormData) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}

export async function signup(prevState: any, formData: FormData) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string

    // Sign up with email confirmation disabled
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
            },
            emailRedirectTo: undefined, // Skip email confirmation
        },
    })

    if (error) {
        return { error: error.message }
    }

    // If signup successful and user is confirmed, redirect to dashboard
    if (data.user && data.session) {
        revalidatePath('/', 'layout')
        redirect('/dashboard')
    }

    // If user needs confirmation (shouldn't happen with disabled confirmation)
    return { message: 'Account created successfully! Redirecting...' }
}

export async function logout() {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/auth/login')
}
