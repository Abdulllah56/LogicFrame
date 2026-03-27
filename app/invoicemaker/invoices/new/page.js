"use client";

import { useAuth } from "../../client/hooks/useAuth";
import { InvoiceForm } from "../../client/components/invoice-form";
import "../../style.css";

export default function NewInvoice() {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <InvoiceForm isPage={true} />
    </div>
  );
}
