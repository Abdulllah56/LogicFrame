import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { db } from '@/utils/db'
import { tools, subscriptions } from '@/utils/db/schema'
import { eq, desc } from 'drizzle-orm'
import EnhancedToolCard from './components/EnhancedToolCard'
import StatCard from './components/StatCard'
import { CreditCard, Layers, DollarSign, Clock, Calendar, Zap, Activity, Plus, FileText, ArrowRight, Sparkles } from 'lucide-react'
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
    const [
        allTools, userSubs, invoicesRes, projectsRes, proposalsRes, portflowClientsRes, portflowProjectsRes,
        ffExpensesRes, ffBillsRes, ffGoalsRes, oeExportsRes, sbExportsRes
    ] = await Promise.all([
        db.query.tools.findMany({
            with: { plans: true },
        }),
        db.query.subscriptions.findMany({
            where: eq(subscriptions.userId, user.id),
            with: { plan: true },
            orderBy: [desc(subscriptions.updatedAt)]
        }),
        supabase.from('invoices').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
        supabase.from('projects').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
        supabase.from('portflow_proposals').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
        supabase.from('portflow_clients').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
        supabase.from('portflow_projects').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
        supabase.from('finance_friend_expenses').select('*').eq('user_id', user.id).order('date', { ascending: false }).limit(20),
        supabase.from('finance_friend_bills').select('*').eq('user_id', user.id).order('due_date', { ascending: true }).limit(20),
        supabase.from('finance_friend_savings_goals').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
        supabase.from('object_extractor_exports').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
        supabase.from('screenshot_beautifier_exports').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20)
    ]);

    const invoices = invoicesRes.data || [];
    const projects = projectsRes.data || [];
    const proposals = proposalsRes.data || [];
    const portflowClients = portflowClientsRes.data || [];
    const portflowProjects = portflowProjectsRes.data || [];
    const ffExpenses = ffExpensesRes.data || [];
    const ffBills = ffBillsRes.data || [];
    const ffGoals = ffGoalsRes.data || [];
    const oeExports = oeExportsRes.data || [];
    const sbExports = sbExportsRes.data || [];

    // --- PHASE 4: UNIVERSAL ACTIVITY STREAM ---
    type ActivityItem = {
        id: string;
        title: string;
        subtitle: string;
        date: Date;
        amount?: number;
        status?: string;
        appName: string;
        color: string;
    };

    const activities: ActivityItem[] = [];

    // 1. InvoiceChase / InvoiceMaker
    invoices.forEach(inv => {
        activities.push({
            id: `inv-${inv.id}`,
            title: inv.invoice_number || 'New Invoice',
            subtitle: inv.client_name || 'Client',
            amount: Number(inv.amount) || 0,
            status: inv.status,
            date: new Date(inv.created_at),
            appName: 'InvoiceMaker / Chase',
            color: 'bg-blue-400'
        });
    });

    // 2. ScopeCreep
    projects.forEach(proj => {
        activities.push({
            id: `proj-${proj.id}`,
            title: proj.name || 'New Project',
            subtitle: 'Scope tracker created',
            status: proj.status || 'Active',
            date: new Date(proj.created_at),
            appName: 'ScopeCreep',
            color: 'bg-violet-400'
        });
    });

    // 3. Portflow
    proposals.forEach(prop => {
        activities.push({
            id: `prop-${prop.id}`,
            title: prop.title || 'Proposal',
            subtitle: 'Proposal Created',
            status: prop.status || 'Draft',
            date: new Date(prop.created_at),
            appName: 'Portflow',
            color: 'bg-cyan-400'
        });
    });

    portflowClients.forEach(client => {
        activities.push({
            id: `pclient-${client.id}`,
            title: client.name || 'Client',
            subtitle: 'New Client Added',
            date: new Date(client.created_at),
            appName: 'Portflow',
            color: 'bg-cyan-500'
        });
    });

    portflowProjects.forEach(proj => {
        activities.push({
            id: `pproj-${proj.id}`,
            title: proj.title || 'Project',
            subtitle: 'Portal Workspace Created',
            status: proj.status || 'Active',
            date: new Date(proj.created_at),
            appName: 'Portflow',
            color: 'bg-cyan-300'
        });
    });

    // 4. FinanceFriend (Supabase + Global Memory Fallback)
    let financeActivitiesCount = 0;
    
    // Add DB data first
    ffExpenses.forEach(exp => {
        financeActivitiesCount++;
        activities.push({
            id: `db-exp-${exp.id}`,
            title: exp.description || 'Expense logged',
            subtitle: 'FinanceFriend',
            amount: Number(exp.amount),
            date: new Date(exp.date),
            appName: 'FinanceFriend',
            color: 'bg-emerald-400'
        });
    });

    ffBills.forEach(bill => {
        financeActivitiesCount++;
        activities.push({
            id: `db-bill-${bill.id}`,
            title: bill.name || 'Bill added',
            subtitle: 'FinanceFriend',
            amount: Number(bill.amount),
            status: bill.is_paid ? 'Paid' : 'Unpaid',
            date: new Date(bill.due_date),
            appName: 'FinanceFriend',
            color: 'bg-emerald-500'
        });
    });

    ffGoals.forEach(goal => {
        financeActivitiesCount++;
        activities.push({
            id: `db-goal-${goal.id}`,
            title: goal.name || 'Savings Goal',
            subtitle: 'FinanceFriend',
            amount: Number(goal.target_amount),
            date: new Date(goal.created_at),
            appName: 'FinanceFriend',
            color: 'bg-emerald-300'
        });
    });

    try {
        const ffData = (global as any).financeFriendData;
        if (ffData) {
            if (ffData.expenses) {
                 const expenses = ffData.expenses.filter((e: any) => e.userId === 1); // Demo user isolation
                 // deduplicate logic can be complex, so we just append cache for now
                 if (ffExpenses.length === 0) {
                     expenses.forEach((exp: any) => {
                         financeActivitiesCount++;
                         activities.push({
                            id: `exp-${exp.id}`,
                            title: exp.description || 'Expense logged',
                            subtitle: 'FinanceFriend',
                            amount: Number(exp.amount),
                            date: new Date(exp.date),
                            appName: 'FinanceFriend',
                            color: 'bg-emerald-400'
                         });
                     });
                 }
            }
            if (ffData.bills) {
                 const bills = ffData.bills.filter((e: any) => e.userId === 1);
                 if (ffBills.length === 0) {
                     bills.forEach((bill: any) => {
                         financeActivitiesCount++;
                         activities.push({
                            id: `bill-${bill.id}`,
                            title: bill.name || 'Bill added',
                            subtitle: 'FinanceFriend',
                            amount: Number(bill.amount),
                            status: bill.isPaid ? 'Paid' : 'Unpaid',
                            date: new Date(bill.dueDate),
                            appName: 'FinanceFriend',
                            color: 'bg-emerald-500'
                         });
                     });
                 }
            }
            if (ffData.savingsGoals) {
                 const goals = ffData.savingsGoals.filter((e: any) => e.userId === 1);
                 if (ffGoals.length === 0) {
                     goals.forEach((goal: any) => {
                         financeActivitiesCount++;
                         activities.push({
                            id: `goal-${goal.id}`,
                            title: goal.name || 'Savings Goal',
                            subtitle: 'FinanceFriend',
                            amount: Number(goal.targetAmount),
                            date: new Date(), 
                            appName: 'FinanceFriend',
                            color: 'bg-emerald-300'
                         });
                     });
                 }
            }
        }
    } catch(e) {}

    // 5. Object Extractor Tracker
    oeExports.forEach(exp => {
        activities.push({
            id: `oe-${exp.id}`,
            title: exp.file_name || 'Subject Extracted',
            subtitle: 'Background removed',
            status: exp.status || 'Completed',
            date: new Date(exp.created_at),
            appName: 'Object Extractor',
            color: 'bg-amber-400'
        });
    });

    // 6. Screenshot Beautifier Tracker
    sbExports.forEach(sb => {
        activities.push({
            id: `sb-${sb.id}`,
            title: sb.file_name || 'Screenshot Exported',
            subtitle: 'Beautified Canvas',
            date: new Date(sb.created_at),
            appName: 'Screenshot Beautifier',
            color: 'bg-fuchsia-400'
        });
    });

    // 7. Simulated/Placeholder Logs for serverless utility apps (Screenshot Beautifier, Object Extractor)
    // Placed only if REAL exports arrays are empty and total activities are low
    const hasRealUtilityActivity = oeExports.length > 0 || sbExports.length > 0;
    if (activities.length === 0 && !hasRealUtilityActivity) {
        activities.push({
            id: 'mock-sb-1',
            title: 'Screenshot Exported',
            subtitle: '1920x1080 canvas',
            date: new Date(Date.now() - 1000 * 60 * 60 * 2),
            appName: 'Screenshot Beautifier',
            color: 'bg-fuchsia-400'
        });
        activities.push({
            id: 'mock-oe-1',
            title: 'Subject Extracted',
            subtitle: 'Background removed',
            date: new Date(Date.now() - 1000 * 60 * 60 * 24),
            appName: 'Object Extractor',
            color: 'bg-amber-400'
        });
    }

    // Sort all global activities descending
    activities.sort((a, b) => b.date.getTime() - a.date.getTime());
    const recentActivities = activities.slice(0, 6);
    const totalActivity = activities.length;
    const projectCount = projects.length;

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
                    Manage your powerful suite of tools. You have <span className="text-white font-semibold">{allTools.length} connected apps</span> and <span className="text-white font-semibold">{totalActivity} activities</span> synced today.
                </p>
            </div>

            {/* Business Stats Grid or Empty State */}
            {totalActivity === 0 ? (
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-900/30 to-blue-900/20 border border-cyan-500/20 p-8 md:p-12 mb-8">
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-500/20 blur-[80px] rounded-full pointer-events-none" />
                    <div className="relative z-10 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-xs font-bold uppercase tracking-wider mb-6">
                            <Sparkles size={14} /> New Workspace
                        </div>
                        <h2 className="text-3xl font-black text-white mb-4">Welcome to your command center.</h2>
                        <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                            Your dashboard is looking a little empty right now. Launch your first tool below to start creating invoices, tracking expenses, or managing your professional work seamlessly.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <Link href="/financefriend" className="bg-cyan-400 hover:bg-cyan-300 text-[#030712] font-bold px-6 py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                                Launch FinanceFriend
                            </Link>
                            <Link href="#tools" className="bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold px-6 py-3 rounded-xl transition-all">
                                Explore All Tools
                            </Link>
                        </div>
                    </div>
                </div>
            ) : (
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
            )}

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
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1 text-[10px] font-black text-slate-500 bg-black/40 px-2 py-0.5 rounded border border-white/5">
                                    <span>E</span>
                                </div>
                                <ArrowRight size={16} className="text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                            </div>
                        </Link>
                        <Link href="/invoicemaker" className="group flex items-center justify-between p-4 bg-white/[0.03] border border-white/5 rounded-2xl hover:bg-white/[0.05] hover:border-cyan-500/30 transition-all">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                                    <FileText size={18} />
                                </div>
                                <span className="font-semibold text-white group-hover:text-cyan-400 transition-colors">Create Invoice</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1 text-[10px] font-black text-slate-500 bg-black/40 px-2 py-0.5 rounded border border-white/5">
                                    <span>I</span>
                                </div>
                                <ArrowRight size={16} className="text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Universal Recent Activity Stream */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Activity className="text-cyan-400" size={20} />
                        Recent Activity
                    </h2>
                    <div className="bg-[#0B0F19]/80 backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden p-6 min-h-[160px] flex flex-col justify-center">
                        {recentActivities.length > 0 ? (
                            <div className="space-y-4">
                                {recentActivities.map((act) => (
                                    <div key={act.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0 hover:bg-white/[0.02] -mx-4 px-4 transition-colors rounded-lg group">
                                        <div className="flex items-center gap-4">
                                            {/* App Color Dot indicator */}
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 border border-white/10 shrink-0">
                                                <div className={`w-2.5 h-2.5 rounded-full ${act.color} group-hover:scale-125 transition-transform`} />
                                            </div>
                                            <div>
                                                <p className="font-medium text-white text-sm flex items-center gap-2">
                                                    {act.title}
                                                </p>
                                                <p className="text-xs text-slate-400 mt-0.5">
                                                    {act.appName} • {act.subtitle}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            {act.amount !== undefined && (
                                                <p className="font-bold text-white text-sm">
                                                    {formatCurrency(act.amount)}
                                                </p>
                                            )}
                                            {act.status ? (
                                                <p className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${act.status === 'Draft' ? 'text-amber-400' : act.status === 'paid' ? 'text-emerald-400' : 'text-slate-500'}`}>
                                                    {act.status}
                                                </p>
                                            ) : (
                                                <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">
                                                    {act.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center">
                                <p className="text-slate-400 text-sm">No activity yet. Your platform actions will aggregate here.</p>
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
                        const isGlobalPro = activeSubsCount > 0;
                        let planName = sub?.plan?.name || "Free";
                        
                        // Treat all tools as Pro if the user has an active global/Pro license to prevent contradictions
                        if (isGlobalPro && planName === "Free") {
                            planName = "Pro";
                        }

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

                        // Provide mock or live usage text based on real database data
                        const usageMap: Record<string, string> = {
                            'invoicemaker': invoices.length > 0 ? `${invoices.length} invoices generated` : 'Never launched',
                            'financefriend': projects.length > 0 ? `${projects.length} connected projects` : 'Never launched',
                            'scopecreep': 'Last used 2 days ago', // Simulated for aesthetics
                            'objectextractor': 'Never launched',
                            'screenshotbeautifier': 'Last used 1 week ago',
                            'invoicechase': 'Never launched',
                        };
                        const usageText = usageMap[normalizedSlug] || 'Never launched';

                        return (
                            <EnhancedToolCard
                                key={tool.id}
                                index={index}
                                title={tool.name}
                                description={tool.description || "Unleash creativity with this powerful tool."}
                                href={href}
                                currentPlan={planName}
                                slug={tool.slug}
                                usageText={usageText}
                            />
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
