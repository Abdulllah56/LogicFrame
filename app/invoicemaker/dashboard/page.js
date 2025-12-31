"use client";

import { useEffect } from "react";
import { useAuth } from "../client/hooks/useAuth";
import { useToast } from "../client/hooks/use-toast";
import { formatCurrency } from "../client/lib/invoice-utils";
import { useInvoices } from "../client/hooks/useInvoices";
import { Card, CardContent, CardHeader, CardTitle } from "../client/components/ui/card";
import { FileText, DollarSign, Clock, AlertTriangle, Plus, ArrowRight } from "lucide-react";

export default function Dashboard() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { invoices, isLoading, getStats, loadInvoices } = useInvoices();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Demo Mode",
        description: "Currently viewing in demo mode",
      });
    }
  }, [isAuthenticated, authLoading, toast]);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'invoicemaker_invoices') {
        loadInvoices();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    const intervalId = setInterval(loadInvoices, 5000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, [loadInvoices]);

  const stats = getStats();
  const statsLoading = isLoading;

  const recentInvoices = [...invoices].sort((a, b) =>
    new Date(b.createdAt) - new Date(a.createdAt)
  ).slice(0, 5);
  const invoicesLoading = isLoading;

  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-10 relative min-h-screen">
      <div className="fixed inset-0 bg-gradient-radial from-[rgba(0,217,255,0.08)] from-0% to-transparent to-50% via-[rgba(0,217,255,0.06)] via-80% z-[-1] pointer-events-none"></div>
      <div className="fixed w-[300px] h-[300px] bg-[rgba(0,217,255,0.3)] rounded-full blur-[80px] opacity-30 top-[10%] left-[10%] animate-float z-[-1] pointer-events-none"></div>
      <div className="fixed w-[400px] h-[400px] bg-[rgba(0,217,255,0.2)] rounded-full blur-[80px] opacity-30 bottom-[10%] right-[10%] animate-float animation-delay-7000 z-[-1] pointer-events-none"></div>
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Welcome back, {user?.firstName || "User"}!
        </h1>
        <p className="text-base text-muted-foreground">
          Here's a snapshot of your invoicing activity.
        </p>
      </div>

      <div className="dashboard-grid">
        <StatCard
          title="Total Invoices"
          value={stats?.totalInvoices || 0}
          icon={FileText}
          loading={statsLoading}
          color="text-cyan-600 dark:text-[#00D9FF]"
        />
        <StatCard
          title="Paid Amount"
          value={formatCurrency(stats?.paidAmount || 0)}
          icon={DollarSign}
          loading={statsLoading}
          color="text-green-600 dark:text-[#4ade80]"
        />
        <StatCard
          title="Pending"
          value={formatCurrency(stats?.pendingAmount || 0)}
          icon={Clock}
          loading={statsLoading}
          color="text-orange-600 dark:text-[#fb923c]"
        />
        <StatCard
          title="Overdue"
          value={formatCurrency(stats?.overdueAmount || 0)}
          icon={AlertTriangle}
          loading={statsLoading}
          color="text-red-600 dark:text-[#f87171]"
        />
      </div>

      <div className="recent-invoices-card">
        <div className="recent-invoices-header">
          <h2 className="recent-invoices-title">Recent Invoices</h2>
          <a href="/invoicemaker/invoices" className="text-sm font-medium text-primary hover:underline flex items-center gap-1 transition-colors group">
            View All
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </a>
        </div>
        {invoicesLoading ? (
          <div className="p-6">
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-2">
                  <div className="w-10 h-10 bg-muted animate-pulse rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                    <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
                  </div>
                  <div className="h-5 bg-muted animate-pulse rounded w-20" />
                </div>
              ))}
            </div>
          </div>
        ) : recentInvoices.length === 0 ? (
          <div className="no-invoices-container">
            <div className="no-invoices-icon">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="no-invoices-title">No Invoices Found</h3>
            <p className="no-invoices-description">It looks like you haven't created any invoices yet. Get started by creating your first one.</p>
            <a href="/invoicemaker/invoices/new" className="common-button">
              <Plus className="h-4 w-4 mr-2" />
              Create First Invoice
            </a>
          </div>
        ) : (
          <table className="recent-invoices-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>To</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {recentInvoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td>{invoice.invoiceNumber}</td>
                  <td>{invoice.to?.name || 'N/A'}</td>
                  <td>{formatCurrency(invoice.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0))}</td>
                  <td><StatusBadge status={invoice.status} /></td>
                  <td>{new Date(invoice.createdAt).toLocaleDateString()}</td>
                  <td>
                    <a href={`/invoicemaker/invoices/${invoice.id}`} className="text-primary hover:underline">
                      View
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const StatCard = ({ title, value, icon: Icon, loading, color, bgColor }) => (
  <div className="stat-card">
    <div className="stat-card-header">
      <h3 className="stat-card-title">{title}</h3>
      <div className={`stat-card-icon ${bgColor}`}>
        <Icon className={`h-6 w-6 ${color}`} />
      </div>
    </div>
    <div>
      {loading ? (
        <div className="h-8 bg-muted animate-pulse rounded w-24 mt-1" />
      ) : (
        <p className={`stat-card-value ${color}`}>{value}</p>
      )}
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const statusConfig = {
    paid: { text: "Paid", className: "status-paid" },
    pending: { text: "Pending", className: "status-pending" },
    overdue: { text: "Overdue", className: "status-overdue" },
    default: { text: "Draft", className: "status-draft" },
  };

  const { text, className } = statusConfig[status] || statusConfig.default;

  return (
    <span className={`status-badge ${className}`}>
      {text}
    </span>
  );
};