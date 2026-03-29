import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from './useToast';
import { useCallback } from 'react';

export function useInvoices() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // 1. Fetch Invoices
  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['/api/invoicemaker/invoices'],
    queryFn: async () => {
      const res = await fetch('/api/invoicemaker/invoices');
      if (!res.ok) throw new Error('Failed to fetch invoices');
      return res.json();
    }
  });

  // 2. Create Invoice
  const saveMutation = useMutation({
    mutationFn: async (invoiceData) => {
      const res = await fetch('/api/invoicemaker/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoiceData)
      });
      if (!res.ok) throw new Error('Failed to save invoice');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/invoicemaker/invoices'] });
      toast({ title: 'Success', description: 'Invoice saved successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });

  // 3. Update Invoice
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }) => {
      const res = await fetch(`/api/invoicemaker/invoices/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!res.ok) throw new Error('Failed to update invoice');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/invoicemaker/invoices'] });
      toast({ title: 'Success', description: 'Invoice updated successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });

  // 4. Delete Invoice
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`/api/invoicemaker/invoices/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete invoice');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/invoicemaker/invoices'] });
      toast({ title: 'Success', description: 'Invoice deleted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });

  // 5. Duplication logic
  const duplicateInvoice = async (invoice) => {
    const { id, created_at, updated_at, items, invoice_number, ...rest } = invoice;
    const duplicatedData = {
      ...rest,
      invoiceNumber: `${invoice_number}-COPY`,
      status: 'pending',
      items: items.map(({ id: item_id, invoice_id, ...itemRest }) => itemRest)
    };
    return saveMutation.mutateAsync(duplicatedData);
  };

  const getStats = useCallback(() => {
    return invoices.reduce((stats, invoice) => {
      const total = parseFloat(invoice.total || 0);
      
      stats.totalInvoices += 1;
      if (invoice.status === 'paid') {
        stats.paidAmount += total;
      } else if (invoice.status === 'pending') {
        stats.pendingAmount += total;
      } else if (invoice.status === 'overdue') {
        stats.overdueAmount += total;
      }
      
      return stats;
    }, {
      totalInvoices: 0,
      paidAmount: 0,
      pendingAmount: 0,
      overdueAmount: 0
    });
  }, [invoices]);

  const getInvoiceById = useCallback((id) => {
    return invoices.find(inv => inv.id === id);
  }, [invoices]);

  return {
    invoices,
    isLoading,
    saveInvoice: saveMutation.mutate,
    updateInvoice: (id, updates) => updateMutation.mutate({ id, updates }),
    deleteInvoice: deleteMutation.mutate,
    duplicateInvoice,
    getInvoiceById,
    getStats,
  };
}