import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { db } from '@/utils/db'
import { tools, subscriptions } from '@/utils/db/schema'
import { eq } from 'drizzle-orm'
import EnhancedToolCard from './components/EnhancedToolCard'
import StatCard from './components/StatCard'
import { Activity, CreditCard, Sparkles, Layers } from 'lucide-react'

export default async function DashboardPage() {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth/login')
    }

    const [allTools, userSubs] = await Promise.all([
        db.query.tools.findMany({
            with: {
                plans: true,
            },
        }),
        db.query.subscriptions.findMany({
            where: eq(subscriptions.userId, user.id),
            with: {
                plan: true,
            }
        })
    ]);

    const activeSubsCount = userSubs.filter(s => s.status === 'active').length;

    // Calculate Pro vs Free stats (Mock logic for now if plans data missing)
    const proToolCount = userSubs.filter(s => s.status === 'active' && s.plan?.name !== 'Free').length;

    return (
        <div className="space-y-12 max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="relative">
                <div className="absolute -left-10 -top-10 w-32 h-32 bg-cyan-500/20 blur-[60px] rounded-full" />
                <h1 className="text-4xl font-black text-white tracking-tight leading-tight relative z-10">
                    Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">{user.user_metadata.full_name?.split(' ')[0] || 'Creator'}</span>
                </h1>
                <p className="text-slate-400 mt-2 text-lg max-w-2xl">
                    Manage your powerful suite of tools. You have <span className="text-white font-semibold">{activeSubsCount} active apps</span> running today.
                </p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Active Tools"
                    value={activeSubsCount}
                    icon={Layers}
                    color="cyan"
                    trend="+1 this week"
                    trendUp={true}
                />
                <StatCard
                    title="Pro Subscriptions"
                    value={proToolCount}
                    icon={Sparkles}
                    color="purple"
                />
                <StatCard
                    title="API Usage"
                    value="24%"
                    icon={Activity}
                    color="blue"
                    trend="Normal load"
                />
                <StatCard
                    title="Billing Status"
                    value="Active"
                    icon={CreditCard}
                    color="green"
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
                        let href = `/${tool.slug}`;

                        // Explicit mappings for known tools where slug might not match folder exactly
                        const slugLower = tool.slug.toLowerCase().replace(/\s+/g, '');
                        if (slugLower === 'financefriend') href = '/financefriend';
                        else if (slugLower === 'scopecreep' || slugLower === 'scope-creep') href = '/scopecreep';
                        else if (slugLower === 'invoicechase') href = '/invoicechase';
                        else if (slugLower === 'invoicemaker') href = '/invoicemaker';
                        else if (slugLower === 'objectextractor' || slugLower === 'object-extractor') href = '/Object-Extractor';
                        else if (slugLower === 'screenshotbeautifier') href = '/screenshotbeautifier';

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
