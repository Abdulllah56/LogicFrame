"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useToast } from "../hooks/useToast";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  MoreHorizontal,
  Eye,
  Edit,
  Download,
  Trash2,
  Search,
  Plus,
  FileText,
  Filter,
  ListOrdered
} from "lucide-react";
import { InvoiceForm } from "./invoice-form";
import { TemplatePicker } from "./template-picker";

// Local storage utilities for invoices persistence
const LS_KEY = 'invoicemaker_invoices';

function loadInvoices() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveInvoices(invoices) {
  localStorage.setItem(LS_KEY, JSON.stringify(invoices));
}

export function InvoiceTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["local/invoices"],
    queryFn: async () => loadInvoices(),
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchInterval: 1000, // Refresh every second
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      const list = loadInvoices();
      const idx = list.findIndex((inv) => inv.id === id);
      if (idx === -1) throw new Error("Invoice not found");
      list[idx] = { ...list[idx], status };
      saveInvoices(list);
      return list[idx];
    },
    onSuccess: (_data, variables) => {
      // Update cache immediately
      queryClient.setQueryData(["local/invoices"], (old) => {
        if (!old) return old;
        return old.map((inv) => (inv.id === variables.id ? { ...inv, status: variables.status } : inv));
      });
      queryClient.invalidateQueries({ queryKey: ["local/invoices"] });
      toast({ title: "Status updated", description: "Invoice status updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (invoiceId) => {
      const list = loadInvoices().filter((inv) => inv.id !== invoiceId);
      saveInvoices(list);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["local/invoices"] });
      toast({
        title: "Success",
        description: "Invoice deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filter and sort invoices
  const filteredInvoices = invoices
    .filter((invoice) => {
      const matchesSearch =
        invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        case "date-asc":
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        case "amount-desc":
          return parseFloat(b.total) - parseFloat(a.total);
        case "amount-asc":
          return parseFloat(a.total) - parseFloat(b.total);
        default:
          return 0;
      }
    });

  const getStatusBadge = (status) => {
    switch (status) {
      case "paid":
        return <Badge className="status-badge status-paid">Paid</Badge>;
      case "pending":
        return <Badge className="status-badge status-pending">Pending</Badge>;
      case "overdue":
        return <Badge className="status-badge status-overdue">Overdue</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleEdit = (invoice) => {
    setEditingInvoice(invoice);
    setIsFormOpen(true);
  };

  const handleDelete = (invoiceId) => {
    if (confirm("Are you sure you want to delete this invoice?")) {
      deleteMutation.mutate(invoiceId);
    }
  };

  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const handleDownloadPDF = async (invoice) => {
    setSelectedInvoice(invoice);
    setShowTemplatePicker(true);
  };

  const handleGeneratePDF = async (templateData) => {
    if (!selectedInvoice) return;

    toast({
      title: "Generating PDF",
      description: "Please wait while we prepare your invoice...",
    });

    try {
      const { pdf } = await import('@react-pdf/renderer');
      const { StyledInvoicePDF } = await import('./styled-invoice-pdf');

      // Generate PDF with template
      const blob = await pdf(
        <StyledInvoicePDF
          invoice={selectedInvoice}
          template={templateData.template}
          logo={templateData.logo}
        />
      ).toBlob();

      // Download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${selectedInvoice.invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();

      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);

      toast({
        title: "Success",
        description: "Invoice PDF has been downloaded",
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate PDF",
        variant: "destructive",
      });
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingInvoice(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Invoices</h1>
          <p className="text-muted-foreground">Manage your invoices here.</p>
        </div>
        <Button
          onClick={() => setIsFormOpen(true)}
          className="common-button"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Invoice
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 p-4 recent-invoices-card">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search by client, project, or invoice number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full lg:w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <ListOrdered className="w-4 h-4 text-muted-foreground" />
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc">Sort by: Latest First</SelectItem>
              <SelectItem value="date-asc">Sort by: Oldest First</SelectItem>
              <SelectItem value="amount-desc">Sort by: Highest Amount</SelectItem>
              <SelectItem value="amount-asc">Sort by: Lowest Amount</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="recent-invoices-card">
        <Table className="recent-invoices-table">
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInvoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-16">
                  <div className="flex flex-col items-center gap-4">
                    <FileText className="h-16 w-16 text-muted-foreground/30" />
                    <h3 className="text-xl font-semibold text-foreground">No invoices yet</h3>
                    <p className="text-muted-foreground">Create your first invoice to get started.</p>
                    <Button onClick={() => setIsFormOpen(true)} className="common-button mt-4">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Invoice
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="font-semibold">{invoice.invoiceNumber}</div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(invoice.createdAt || Date.now()), "MMM dd, yyyy")}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{invoice.clientName}</div>
                    <div className="text-xs text-muted-foreground truncate max-w-[200px]">{invoice.clientEmail}</div>
                  </TableCell>
                  <TableCell>{invoice.projectName}</TableCell>
                  <TableCell className="font-semibold">${invoice.total}</TableCell>
                  <TableCell>{format(new Date(invoice.dueDate), "MMM dd, yyyy")}</TableCell>
                  <TableCell>
                    {getStatusBadge(invoice.status)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem asChild>
                          <Link href={`/invoicemaker/invoices/${invoice.id}`} className="flex items-center gap-2 cursor-pointer">
                            <Eye className="w-4 h-4" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(invoice)} className="flex items-center gap-2 cursor-pointer">
                          <Edit className="w-4 h-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownloadPDF(invoice)} className="flex items-center gap-2 cursor-pointer">
                          <Download className="w-4 h-4" />
                          Download PDF
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="w-full justify-start px-2 py-1.5 text-sm">
                              Change Status
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent side="right" className="w-40">
                            <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ id: invoice.id, status: 'paid' })}>
                              Paid
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ id: invoice.id, status: 'pending' })}>
                              Pending
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ id: invoice.id, status: 'overdue' })}>
                              Overdue
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDelete(invoice.id)} className="flex items-center gap-2 text-red-500 focus:text-red-500 cursor-pointer">
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Invoice Form Modal */}
      <InvoiceForm
        open={isFormOpen}
        onOpenChange={handleCloseForm}
        invoice={editingInvoice || undefined}
        mode={editingInvoice ? "edit" : "create"}
      />

      {/* Template Picker Dialog */}
      {showTemplatePicker && selectedInvoice && (
        <TemplatePicker
          invoice={selectedInvoice}
          onGenerate={handleGeneratePDF}
          onClose={() => {
            setShowTemplatePicker(false);
            setSelectedInvoice(null);
          }}
        />
      )}
    </div>
  );
}