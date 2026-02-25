import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { db } from '@/utils/db'
import { tools, subscriptions } from '@/utils/db/schema'
import { eq, desc } from 'drizzle-orm'
import EnhancedToolCard from './components/EnhancedToolCard'
import StatCard from './components/StatCard'
import { Activity, CreditCard, Sparkles, Layers } from 'lucide-react'

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth/login')
    }

    // Fetch dashboard data in parallel
    const [allTools, userSubs, invoiceCountData, projectCountData] = await Promise.all([
        db.query.tools.findMany({
            with: {
                plans: true,
            },
        }),
        db.query.subscriptions.findMany({
            where: eq(subscriptions.userId, user.id),
            with: {
                plan: true,
            },
            orderBy: [desc(subscriptions.updatedAt)]
        }),
        supabase.from('invoices').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('projects').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
    ]);

    const activeSubsCount = userSubs.filter(s => s.status === 'active').length;
    const invoiceCount = invoiceCountData.count || 0;
    const projectCount = projectCountData.count || 0;
    const totalActivity = invoiceCount + projectCount;

    // Calculate Pro vs Free stats
    const proToolCount = userSubs.filter(s => s.status === 'active' && s.plan?.name !== 'Free').length;

    // Billing status based on latest subscription
    const billingStatus = userSubs.length > 0
        ? userSubs[0].status.charAt(0).toUpperCase() + userSubs[0].status.slice(1)
        : 'Inactive';

    // API Usage mock calculation based on activity (realistically would be rows / limit)
    const usageLimit = 100;
    const usagePercent = Math.min(Math.round((totalActivity / usageLimit) * 100), 100);

    return (
        <div className="space-y-12 max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="relative">
                <div className="absolute -left-10 -top-10 w-32 h-32 bg-cyan-500/20 blur-[60px] rounded-full" />
                <h1 className="text-4xl font-black text-white tracking-tight leading-tight relative z-10">
                    Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">{user.user_metadata.full_name?.split(' ')[0] || 'Creator'}</span>
                </h1>
                <p className="text-slate-400 mt-2 text-lg max-w-2xl">
                    Manage your powerful suite of tools. You have <span className="text-white font-semibold">{activeSubsCount} active apps</span> and <span className="text-white font-semibold">{totalActivity} items</span> synced today.
                </p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Active Tools"
                    value={activeSubsCount}
                    icon={Layers}
                    color="cyan"
                    trend={`${allTools.length - activeSubsCount} available`}
                    trendUp={true}
                />
                <StatCard
                    title="Pro Subscriptions"
                    value={proToolCount}
                    icon={Sparkles}
                    color="purple"
                    trend={`${userSubs.length} total`}
                    trendUp={userSubs.length > 0}
                />
                <StatCard
                    title="API Usage"
                    value={`${usagePercent}%`}
                    icon={Activity}
                    color="blue"
                    trend={`${totalActivity} requests`}
                    trendUp={usagePercent < 80}
                />
                <StatCard
                    title="Billing Status"
                    value={billingStatus}
                    icon={CreditCard}
                    color={billingStatus === 'Active' ? 'green' : (billingStatus === 'Inactive' ? 'neutral' : 'yellow')}
                />
            </div>

            {/* Tools Section */}
            <div id="tools" className="space-y-8">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Layers className="text-cyan-400" size={24} />
                        Your Applications
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {allTools.map((tool, index) => {
                        const sub = userSubs.find(s => s.plan?.toolId === tool.id && s.status === 'active');
                        const planName = sub?.plan?.name || "Free";

                        // Map specific routes based on actual app directory structure
                        const normalizedSlug = tool.slug.toLowerCase().replace(/[^a-z0-9]/g, '');

                        // Default fallback
                        let href = `/${tool.slug}`;

                        const routeMap: Record<string, string> = {
                            'financefriend': '/financefriend',
                            'scopecreep': '/scopecreep',
                            'invoicechase': '/invoicechase',
                            'invoicemaker': '/invoicemaker',
                            'screenshotbeautifier': '/screenshotbeautifier',
                            'objectextractor': '/object-extractor',
                        };

                        if (routeMap[normalizedSlug]) {
                            href = routeMap[normalizedSlug];
                        }

                        return (
                            <EnhancedToolCard
                                key={tool.id}
                                index={index}
                                title={tool.name}
                                description={tool.description || "Unleash creativity with this powerful tool."}
                                href={href}
                                currentPlan={planName}
                                slug={tool.slug}
                            />
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
