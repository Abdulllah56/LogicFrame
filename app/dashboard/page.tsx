import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { db } from '@/utils/db'
import { tools, subscriptions } from '@/utils/db/schema'
import { eq, desc } from 'drizzle-orm'
import EnhancedToolCard from './components/EnhancedToolCard'
import StatCard from './components/StatCard'
import { CreditCard, Layers, DollarSign, Clock, Calendar, Zap, Activity, Plus, FileText, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth/login')
    }

    // Fetch dashboard data in parallel
    const [allTools, userSubs, invoicesRes, projectsRes] = await Promise.all([
        db.query.tools.findMany({
            with: { plans: true },
        }),
        db.query.subscriptions.findMany({
            where: eq(subscriptions.userId, user.id),
            with: { plan: true },
            orderBy: [desc(subscriptions.updatedAt)]
        }),
        supabase
            .from('invoices')
            .select('*')
            .eq('user_id', user.id),
        supabase
            .from('projects')
            .select('*')
            .eq('user_id', user.id)
    ]);

    const invoices = invoicesRes.data || [] as any[];
    const projects = projectsRes.data || [] as any[];
    const invoiceCount = invoices.length;
    const projectCount = projects.length;
    const totalActivity = invoiceCount + projectCount;

    // Revenue This Month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const sumAmount = (items: any[]) => items.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

    const getPaidDate = (inv: any) => {
        if (inv.paid_at) return new Date(inv.paid_at);
        if (inv.updated_at) return new Date(inv.updated_at);
        if (inv.created_at) return new Date(inv.created_at);
        return null;
    }

    const paidThisMonth = invoices.filter(inv => inv.status === 'paid' && getPaidDate(inv) && getPaidDate(inv) >= startOfMonth);
    const paidLastMonth = invoices.filter(inv => inv.status === 'paid' && getPaidDate(inv) && getPaidDate(inv) >= startOfLastMonth && getPaidDate(inv) <= endOfLastMonth);

    const revenueThisMonth = sumAmount(paidThisMonth);
    const revenueLastMonth = sumAmount(paidLastMonth) || 1; // avoid divide by zero
    const revenueChangePct = Math.round(((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100);

    const formatCurrency = (n: number) => {
        return `${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
    }

    // Outstanding Invoices
    const unpaid = invoices.filter(inv => inv.status !== 'paid');
    const overdue = unpaid.filter(inv => inv.due_date && new Date(inv.due_date) < now);
    const outstandingTotal = sumAmount(unpaid);

    // Hours Tracked This Week (placeholder until time tracker data source exists)
    // If there is a time entries table later, replace this block with real query.
    const hoursTrackedThisWeek = 0;
    const projectsCountForHours = projects.length;

    // Next Payment Due
    const nextDue = unpaid
        .filter(inv => inv.due_date && new Date(inv.due_date) >= startOfMonth || inv.due_date) // keep all with due_date
        .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())[0];
    const daysUntilDue = nextDue ? Math.ceil((new Date(nextDue.due_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;
    const isOverdue = typeof daysUntilDue === 'number' && daysUntilDue < 0;

    // Active tools
    const activeSubsCount = userSubs.filter(s => s.status === 'active').length;

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

            {/* Business Stats Grid (replaces meaningless zeros) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Card 1 — Revenue This Month */}
                <StatCard
                    title="Revenue This Month"
                    value={formatCurrency(revenueThisMonth)}
                    icon={DollarSign}
                    color="emerald"
                    trend={`${Math.abs(revenueChangePct)}%`}
                    trendUp={revenueChangePct >= 0}
                />

                {/* Card 2 — Outstanding Invoices */}
                <StatCard
                    title="Outstanding Invoices"
                    value={formatCurrency(outstandingTotal)}
                    subText={<>
                        unpaid across {unpaid.length} invoices {overdue.length > 0 && (<span className="text-red-400">• {overdue.length} overdue</span>)}
                    </>}
                    icon={CreditCard}
                    color="amber"
                />

                {/* Card 3 — Hours Tracked This Week */}
                <StatCard
                    title="Hours Tracked This Week"
                    value={`${hoursTrackedThisWeek} hrs`}
                    subText={`Across ${projectsCountForHours} projects`}
                    icon={Clock}
                    color="blue"
                />

                {/* Card 4 — Next Payment Due */}
                <StatCard
                    title="Next Payment Due"
                    value={nextDue ? `${nextDue.invoice_number || nextDue.title || 'Invoice'} • ${formatCurrency(Number(nextDue.amount)||0)} • ${isOverdue ? `overdue by ${Math.abs(daysUntilDue || 0)} days` : `due in ${Math.abs(daysUntilDue || 0)} days`}` : 'No upcoming payments'}
                    subText={nextDue ? (isOverdue ? <span className="text-red-400">Overdue</span> : 'On schedule') : undefined}
                    icon={Calendar}
                    color={isOverdue ? 'red' : 'cyan'}
                />
            </div>

            {/* Quick Actions & Recent Activity Layer */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Contextual Quick Actions */}
                <div className="lg:col-span-1 space-y-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Zap className="text-amber-400" size={20} />
                        Quick Actions
                    </h2>
                    <div className="flex flex-col gap-3">
                        <Link href="/financefriend/expenses" className="group flex items-center justify-between p-4 bg-white/[0.03] border border-white/5 rounded-2xl hover:bg-white/[0.05] hover:border-cyan-500/30 transition-all">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                                    <Plus size={18} />
                                </div>
                                <span className="font-semibold text-white group-hover:text-cyan-400 transition-colors">Log Expense</span>
                            </div>
                            <ArrowRight size={16} className="text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                        </Link>
                        <Link href="/invoicemaker" className="group flex items-center justify-between p-4 bg-white/[0.03] border border-white/5 rounded-2xl hover:bg-white/[0.05] hover:border-cyan-500/30 transition-all">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                                    <FileText size={18} />
                                </div>
                                <span className="font-semibold text-white group-hover:text-cyan-400 transition-colors">Create Invoice</span>
                            </div>
                            <ArrowRight size={16} className="text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                        </Link>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Activity className="text-cyan-400" size={20} />
                        Recent Activity
                    </h2>
                    <div className="bg-[#0B0F19]/80 backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden p-6 min-h-[160px] flex flex-col justify-center">
                        {invoices.length > 0 || projects.length > 0 ? (
                            <div className="space-y-4">
                                {invoices.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 3).map((inv, i) => (
                                    <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-emerald-400" />
                                            <div>
                                                <p className="font-medium text-white text-sm">{inv.invoice_number || 'Invoice generated'}</p>
                                                <p className="text-xs text-slate-400">{new Date(inv.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-white text-sm">{formatCurrency(Number(inv.amount) || 0)}</p>
                                            <p className="text-xs text-slate-500 uppercase">{inv.status}</p>
                                        </div>
                                    </div>
                                ))}
                                {invoices.length === 0 && projects.slice(0,3).map((proj, i) => (
                                    <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-blue-400" />
                                            <div>
                                                <p className="font-medium text-white text-sm">{proj.name || 'New Project'}</p>
                                                <p className="text-xs text-slate-400">{new Date(proj.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-slate-500 uppercase">{proj.status || 'Active'}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center">
                                <p className="text-slate-400 text-sm">No activity yet. Start by logging an expense or creating an invoice!</p>
                            </div>
                        )}
                    </div>
                </div>
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
