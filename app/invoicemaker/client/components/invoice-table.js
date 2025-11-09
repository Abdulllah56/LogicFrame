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
  FileText
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
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Paid</Badge>;
      case "pending":
        return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">Pending</Badge>;
      case "overdue":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Overdue</Badge>;
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
        <Button 
          onClick={() => setIsFormOpen(true)} 
          className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity font-medium"
        >
          <Plus className="w-4 h-4" />
          Create Invoice
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 p-5 bg-card rounded-lg border border-border/50">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full border-border/50 focus:border-border"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full lg:w-36 border-border/50 focus:border-border">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent className="border-border">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full lg:w-44 border-border/50 focus:border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-border">
            <SelectItem value="date-desc">Latest First</SelectItem>
            <SelectItem value="date-asc">Oldest First</SelectItem>
            <SelectItem value="amount-desc">Highest Amount</SelectItem>
            <SelectItem value="amount-asc">Lowest Amount</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border/50 bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/50 hover:bg-transparent">
              <TableHead className="font-semibold">Invoice</TableHead>
              <TableHead className="font-semibold">Client</TableHead>
              <TableHead className="font-semibold">Project</TableHead>
              <TableHead className="font-semibold">Amount</TableHead>
              <TableHead className="font-semibold">Due Date</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="w-[50px] font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInvoices.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={7} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="h-12 w-12 text-muted-foreground/50" />
                    <p className="text-muted-foreground">No invoices found. Create your first invoice to get started!</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <TableCell>
                    <div>
                      <div className="font-semibold text-foreground">{invoice.invoiceNumber}</div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(invoice.createdAt || Date.now()), "MMM dd, yyyy")}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-foreground">{invoice.clientName}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[200px]">{invoice.clientEmail}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-foreground">{invoice.projectName}</TableCell>
                  <TableCell className="font-semibold text-foreground tabular-nums">${invoice.total}</TableCell>
                  <TableCell className="text-foreground">{format(new Date(invoice.dueDate), "MMM dd, yyyy")}</TableCell>
                  <TableCell>
                    {getStatusBadge(invoice.status)}
                    <Select
                      value={invoice.status}
                      onValueChange={(val) => updateStatusMutation.mutate({ id: invoice.id, status: val })}
                    >
                      <SelectTrigger className="w-[110px] h-8 text-xs font-medium border-border/50 hover:border-border transition-colors mt-1">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent className="border-border">
                        <SelectItem value="paid" className="text-xs">Mark as Paid</SelectItem>
                        <SelectItem value="pending" className="text-xs">Mark as Pending</SelectItem>
                        <SelectItem value="overdue" className="text-xs">Mark as Overdue</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8 hover:bg-muted transition-colors"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent 
                        align="end"
                        className="w-44 border-border"
                      >
                        <DropdownMenuItem 
                          onClick={() => handleEdit(invoice)}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDownloadPDF(invoice)}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <Download className="w-4 h-4" />
                          Download PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          asChild
                          className="cursor-pointer"
                        >
                          <Link href={`/invoicemaker/invoices/${invoice.id}`} className="flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDelete(invoice.id)}
                          className="flex items-center gap-2 text-red-600 dark:text-red-500 focus:text-red-600 dark:focus:text-red-500 cursor-pointer"
                        >
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