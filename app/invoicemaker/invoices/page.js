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
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Invoices</h1>
      </div>
      <InvoiceTable />
    </div>
  );
}
