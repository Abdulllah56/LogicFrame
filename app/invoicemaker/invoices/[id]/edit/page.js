"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../../client/hooks/useAuth";
import { InvoiceForm } from "../../../client/components/invoice-form";
import "../../../style.css";

// Helper to load invoices from local storage
const LS_KEY = 'invoicemaker_invoices';
function loadInvoices() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export default function EditInvoice() {
  const params = useParams();
  const router = useRouter();
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && isAuthenticated && params.id) {
      const list = loadInvoices();
      const found = list.find(inv => String(inv.id) === String(params.id));
      if (found) {
        setInvoice(found);
      } else {
        router.push("/invoicemaker/invoices");
      }
      setLoading(false);
    }
  }, [params.id, authLoading, isAuthenticated, router]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <InvoiceForm 
        invoice={invoice} 
        mode="edit" 
        isPage={true} 
      />
    </div>
  );
}
