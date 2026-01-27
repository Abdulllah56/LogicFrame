
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { db } from '@/utils/db'
import { tools, plans, subscriptions } from '@/utils/db/schema'
import { eq, and } from 'drizzle-orm'
import { notFound, redirect } from 'next/navigation'
import PricingCard, { PaddleLoader } from '../../components/PricingCard'
import Link from 'next/link'

interface PageProps {
    params: Promise<{
        slug: string
    }>
}

export default async function ToolPricingPage({ params }: PageProps) {
    const { slug } = await params
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth/login')
    }

    // 1. Find the tool
    const tool = await db.query.tools.findFirst({
        where: eq(tools.slug, slug),
        with: {
            plans: true,
        }
    });

    if (!tool) {
        notFound();
    }

    // 2. Find current subscription
    const currentSub = await db.query.subscriptions.findFirst({
        where: and(
            eq(subscriptions.userId, user.id),
            eq(subscriptions.status, 'active') // simplified check
        ),
        with: {
            plan: true
        }
    });

    // Filter for plans related to this specific tool
    // (Assuming global subscription check above might return sub for another tool, 
    // so we need to check if currentSub.plan.toolId === tool.id)
    const activePlanId = currentSub?.plan?.toolId === tool.id ? currentSub.planId : null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 py-12 px-4 sm:px-6 lg:px-8">
            <PaddleLoader />
            <div className="max-w-7xl mx-auto">
                <div className="text-center">
                    <Link href="/dashboard" className="text-blue-600 hover:text-blue-500 mb-4 inline-block">
                        &larr; Back to Dashboard
                    </Link>
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
                        {tool.name} Plans
                    </h2>
                    <p className="mt-4 text-xl text-gray-600 dark:text-gray-400">
                        Choose the right plan for your needs.
                    </p>
                </div>

                <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-3">
                    {tool.plans.map((plan) => (
                        <PricingCard
                            key={plan.id}
                            plan={plan}
                            isCurrentPlan={activePlanId === plan.id || (plan.name === 'Free' && !activePlanId)}
                            userEmail={user.email!}
                            userId={user.id}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}
