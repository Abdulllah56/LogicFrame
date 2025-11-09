"use client"
import { useEffect } from "react";
import { useAuth } from "../client/hooks/useAuth";
import { useToast } from "../client/hooks/use-toast";
import { InvoiceTable } from "../client/components/invoice-table";
import "../style.css";

export default function Invoices() {
  const { isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Notify user about demo mode
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Demo Mode",
        description: "Currently viewing in demo mode",
      });
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Invoice Management</h1>
        <p className="text-base text-muted-foreground">Create, manage, and track all your invoices</p>
      </div>
      <InvoiceTable />
    </div>
  );
}
