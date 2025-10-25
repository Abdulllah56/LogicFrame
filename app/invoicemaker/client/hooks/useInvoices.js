import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';

const STORAGE_KEY = 'invoicemaker_invoices';

export function useInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Load invoices from localStorage
  const loadInvoices = useCallback(() => {
    try {
      const storedInvoices = localStorage.getItem(STORAGE_KEY);
      if (storedInvoices) {
        setInvoices(JSON.parse(storedInvoices));
      }
    } catch (error) {
      console.error('Error loading invoices:', error);
      toast({
        title: 'Error',
        description: 'Failed to load invoices',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Save invoice
  const saveInvoice = useCallback((invoiceData) => {
    try {
      const newInvoice = {
        ...invoiceData,
        id: Date.now(),
        createdAt: new Date().toISOString(),
        status: 'pending',
      };

      const updatedInvoices = [...invoices, newInvoice];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedInvoices));
      setInvoices(updatedInvoices);
      // Dispatch storage event for real-time updates
      window.dispatchEvent(new StorageEvent('storage', {
        key: STORAGE_KEY,
        newValue: JSON.stringify(updatedInvoices)
      }));

      toast({
        title: 'Success',
        description: 'Invoice saved successfully',
      });

      return newInvoice;
    } catch (error) {
      console.error('Error saving invoice:', error);
      toast({
        title: 'Error',
        description: 'Failed to save invoice',
        variant: 'destructive',
      });
      return null;
    }
  }, [invoices, toast]);

  // Update invoice
  const updateInvoice = useCallback((id, updates) => {
    try {
      const updatedInvoices = invoices.map(invoice => 
        invoice.id === id ? { ...invoice, ...updates } : invoice
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedInvoices));
      setInvoices(updatedInvoices);
      // Dispatch storage event for real-time updates
      window.dispatchEvent(new StorageEvent('storage', {
        key: STORAGE_KEY,
        newValue: JSON.stringify(updatedInvoices)
      }));

      toast({
        title: 'Success',
        description: 'Invoice updated successfully',
      });
    } catch (error) {
      console.error('Error updating invoice:', error);
      toast({
        title: 'Error',
        description: 'Failed to update invoice',
        variant: 'destructive',
      });
    }
  }, [invoices, toast]);

  // Delete invoice
  const deleteInvoice = useCallback((id) => {
    try {
      const updatedInvoices = invoices.filter(invoice => invoice.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedInvoices));
      setInvoices(updatedInvoices);
      // Dispatch storage event for real-time updates
      window.dispatchEvent(new StorageEvent('storage', {
        key: STORAGE_KEY,
        newValue: JSON.stringify(updatedInvoices)
      }));

      toast({
        title: 'Success',
        description: 'Invoice deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete invoice',
        variant: 'destructive',
      });
    }
  }, [invoices, toast]);

  // Get invoice by id
  const getInvoiceById = useCallback((id) => {
    return invoices.find(invoice => invoice.id === id) || null;
  }, [invoices]);

  // Load invoices on mount
  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  // Calculate invoice stats
  const getStats = useCallback(() => {
    return invoices.reduce((stats, invoice) => {
      const total = invoice.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
      
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

  return {
    invoices,
    isLoading,
    saveInvoice,
    updateInvoice,
    deleteInvoice,
    getInvoiceById,
    getStats,
    loadInvoices
  };
}