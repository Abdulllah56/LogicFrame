// Local storage keys
const STORAGE_KEYS = {
  INVOICES: 'invoicemaker_invoices',
};

export function getInvoices() {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEYS.INVOICES);
  return stored ? JSON.parse(stored) : [];
}

export function saveInvoice(invoice) {
  const invoices = getInvoices();
  const newInvoice = {
    ...invoice,
    id: Date.now(), // Simple way to generate unique IDs
    createdAt: new Date().toISOString(),
    status: 'pending'
  };
  const updatedInvoices = [...invoices, newInvoice];
  localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(updatedInvoices));
  return newInvoice;
}

export function calculateInvoiceStats(invoices) {
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
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
}