"use client";

import { useEffect } from "react";
import { useAuth } from "../client/hooks/useAuth";
import { useToast } from "../client/hooks/use-toast";
import { formatCurrency } from "../client/lib/invoice-utils";
import { useInvoices } from "../client/hooks/useInvoices";
import { Card, CardContent, CardHeader, CardTitle } from "../client/components/ui/card";
import "../style.css"
import { FileText, DollarSign, Clock, AlertTriangle } from "lucide-react";

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
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back, {user?.firstName || "User"}!
        </h1>
        <p className="text-muted-foreground">
          Here's an overview of your invoice activity and key metrics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? (
                <div className="h-8 bg-muted animate-pulse rounded w-16" />
              ) : (
                stats?.totalInvoices || 0
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {statsLoading ? (
                <div className="h-8 bg-muted animate-pulse rounded w-20" />
              ) : (
                formatCurrency(stats?.paidAmount || 0)
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {statsLoading ? (
                <div className="h-8 bg-muted animate-pulse rounded w-20" />
              ) : (
                formatCurrency(stats?.pendingAmount || 0)
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {statsLoading ? (
                <div className="h-8 bg-muted animate-pulse rounded w-20" />
              ) : (
                formatCurrency(stats?.overdueAmount || 0)
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Invoices</CardTitle>
            <a href="/invoicemaker/invoices" className="text-blue-500 hover:text-blue-700 flex items-center gap-1 text-sm font-medium transition-colors">
              View All
              <svg 
                viewBox="0 0 24 24" 
                className="w-4 h-4 transition-transform transform group-hover:translate-x-1" 
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
              >
                <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"></path>
              </svg>
            </a>
          </div>
        </CardHeader>
        <CardContent>
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
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="mx-auto h-12 w-12 mb-4" />
              <h3 className="font-medium mb-2">No invoices yet</h3>
              <p className="text-sm">Create your first invoice to get started!</p>
              <a 
                href="/invoicemaker/invoices" 
                className="create-invoice-btn inline-block mt-4"
              > 
              <button className="animated-button relative flex items-center gap-1 px-8 py-2.5 border-4 border-transparent text-base bg-transparent rounded-full font-semibold text-blue-500 cursor-pointer overflow-hidden hover:text-blue-950 group">
      <svg 
        viewBox="0 0 24 24" 
        className="arr-2 absolute w-6 fill-blue-600 z-10 group-hover:fill-[#212121]" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"></path>
      </svg>
      
      <span className="text relative z-10">Create Invoices</span>
      
      <span className="circle absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-blue-600 rounded-full opacity-0"></span>
      
      <svg 
        viewBox="0 0 24 24" 
        className="arr-1 absolute w-6 fill-blue-600 z-10 group-hover:fill-[#212121]" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"></path>
      </svg>
    </button>
              </a>
            </div>
          ) : (
            <div className="space-y-4">
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
                  <div key={invoice.id} className="flex items-center space-x-4 py-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      invoice.status === "paid" 
                        ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
                        : invoice.status === "pending"
                        ? "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300"
                        : "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300"
                    }`}>
                      {getStatusIcon(invoice.status)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">
                        Invoice {invoice.invoiceNumber} - {invoice.to?.name || 'No Client Name'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(invoice.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`font-medium ${getStatusColor(invoice.status)}`}>
                      {formatCurrency(invoice.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0))}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subscription Status Removed */}
    </div>
  );
}