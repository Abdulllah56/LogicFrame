"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../client/hooks/useAuth";
import { useToast } from "../client/hooks/use-toast";
import { useInvoices } from "../client/hooks/useInvoices";
import { Card, CardContent, CardHeader, CardTitle } from "../client/components/ui/card";
import { InvoiceGenerator } from "../client/components/invoice-generator";

export default function InvoiceView() {
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const { saveInvoice } = useInvoices();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Demo Mode",
        description: "Currently viewing in demo mode",
      });
    }
  }, [authLoading, isAuthenticated, toast]);

  const handleSave = (invoiceData) => {
    const savedInvoice = saveInvoice(invoiceData);
    if (savedInvoice) {
      toast({
        title: "Success",
        description: "Invoice created successfully!",
      });
      router.push('/invoicemaker/dashboard');
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Create New Invoice</CardTitle>
        </CardHeader>
        <CardContent>
          <InvoiceGenerator onSave={handleSave} />
        </CardContent>
      </Card>
    </div>
  );
}
