"use client";

import { useEffect } from "react";
import { useAuth } from "../client/hooks/useAuth";
import { useToast } from "../client/hooks/use-toast";
import { formatCurrency } from "../client/lib/invoice-utils";
import { useInvoices } from "../client/hooks/useInvoices";
import { Card, CardContent, CardHeader, CardTitle } from "../client/components/ui/card";
import "../style.css"
import { FileText, DollarSign, Clock, AlertTriangle, Plus } from "lucide-react";

export default function Dashboard() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { invoices, isLoading, getStats, loadInvoices } = useInvoices();
  
  // Set up mock data for demonstration
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Demo Mode",
        description: "Currently viewing in demo mode",
      });
    }
  }, [isAuthenticated, authLoading, toast]);

  // Listen for storage changes to update in real-time
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'invoicemaker_invoices') {
        loadInvoices();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Check for updates every 5 seconds as a fallback
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
  ).slice(0, 2);
  const invoicesLoading = isLoading;

  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="space-y-1">
        <h1 className="text-4xl font-bold tracking-tight">
          Welcome back, {user?.firstName || "User"}!
        </h1>
        <p className="text-base text-muted-foreground">
          Here's an overview of your invoice activity and key metrics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/50 hover:border-border transition-all duration-200 hover:shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Invoices</CardTitle>
            <div className="h-9 w-9 rounded-lg bg-muted/50 flex items-center justify-center">
              <FileText className="h-4 w-4 text-foreground/70" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">
              {statsLoading ? (
                <div className="h-9 bg-muted animate-pulse rounded w-16" />
              ) : (
                stats?.totalInvoices || 0
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 hover:border-border transition-all duration-200 hover:shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Paid Amount</CardTitle>
            <div className="h-9 w-9 rounded-lg bg-green-500/10 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-green-600 dark:text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-green-600 dark:text-green-500">
              {statsLoading ? (
                <div className="h-9 bg-muted animate-pulse rounded w-24" />
              ) : (
                formatCurrency(stats?.paidAmount || 0)
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 hover:border-border transition-all duration-200 hover:shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            <div className="h-9 w-9 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <Clock className="h-4 w-4 text-orange-600 dark:text-orange-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-orange-600 dark:text-orange-500">
              {statsLoading ? (
                <div className="h-9 bg-muted animate-pulse rounded w-24" />
              ) : (
                formatCurrency(stats?.pendingAmount || 0)
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 hover:border-border transition-all duration-200 hover:shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overdue</CardTitle>
            <div className="h-9 w-9 rounded-lg bg-red-500/10 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-red-600 dark:text-red-500">
              {statsLoading ? (
                <div className="h-9 bg-muted animate-pulse rounded w-24" />
              ) : (
                formatCurrency(stats?.overdueAmount || 0)
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold">Recent Invoices</CardTitle>
            <a href="/invoicemaker/invoices" className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors group">
              View All
              <svg 
                viewBox="0 0 24 24" 
                className="w-4 h-4 transition-transform group-hover:translate-x-0.5" 
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
              >
                <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"></path>
              </svg>
            </a>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          {invoicesLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-muted animate-pulse rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                    <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
                  </div>
                  <div className="h-4 bg-muted animate-pulse rounded w-16" />
                </div>
              ))}
            </div>
          ) : recentInvoices.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <div className="mx-auto h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                <FileText className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">No invoices yet</h3>
              <p className="text-sm mb-6">Create your first invoice to get started!</p>
              <a href="/invoicemaker/invoices">
                <button className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity font-medium text-sm">
                  <Plus className="h-4 w-4" />
                  Create Invoice
                </button>
              </a>
            </div>
          ) : (
            <div className="space-y-1">
              {recentInvoices.map((invoice) => {
                const getStatusColor = (status) => {
                  switch (status) {
                    case "paid":
                      return "text-green-600";
                    case "pending":
                      return "text-orange-600";
                    case "overdue":
                      return "text-red-600";
                    default:
                      return "text-muted-foreground";
                  }
                };

                const getStatusIcon = (status) => {
                  switch (status) {
                    case "paid":
                      return "✓";
                    case "pending":
                      return "○";
                    case "overdue":
                      return "⚠";
                    default:
                      return "○";
                  }
                };

                return (
                  <a 
                    key={invoice.id} 
                    href={`/invoicemaker/invoices/${invoice.id}`}
                    className="flex items-center gap-4 py-4 px-3 rounded-lg hover:bg-muted/50 transition-colors group"
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-semibold ${
                      invoice.status === "paid" 
                        ? "bg-green-500/10 text-green-600 dark:text-green-500"
                        : invoice.status === "pending"
                        ? "bg-orange-500/10 text-orange-600 dark:text-orange-500"
                        : "bg-red-500/10 text-red-600 dark:text-red-500"
                    }`}>
                      {getStatusIcon(invoice.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground group-hover:text-foreground truncate">
                        Invoice {invoice.invoiceNumber}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {invoice.to?.name || 'No Client Name'} • {new Date(invoice.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`font-semibold text-base tabular-nums ${getStatusColor(invoice.status)}`}>
                      {formatCurrency(invoice.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0))}
                    </span>
                  </a>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}