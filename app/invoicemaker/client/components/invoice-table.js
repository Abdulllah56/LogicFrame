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
  Plus
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Invoice Management</h2>
          <p className="text-muted-foreground">Create, manage, and track all your invoices</p>
        </div>
        <Button 
          onClick={() => setIsFormOpen(true)} 
          className="mt-4 sm:mt-0 bg-[#03d0f4] hover:bg-[#02b8d8] text-white transition-all duration-300 ease-in-out border-none rounded-md"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Invoice
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4 p-4 bg-card rounded-lg border">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc">Latest First</SelectItem>
              <SelectItem value="date-asc">Oldest First</SelectItem>
              <SelectItem value="amount-desc">Highest Amount</SelectItem>
              <SelectItem value="amount-asc">Lowest Amount</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card">
        <Table>
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
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No invoices found. Create your first invoice to get started!
                </TableCell>
              </TableRow>
            ) : (
              filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{invoice.invoiceNumber}</div>
                      <div className="text-sm text-muted-foreground">
                        Created: {format(new Date(invoice.createdAt || Date.now()), "MMM dd, yyyy")}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{invoice.clientName}</div>
                      <div className="text-sm text-muted-foreground">{invoice.clientEmail}</div>
                    </div>
                  </TableCell>
                  <TableCell>{invoice.projectName}</TableCell>
                  <TableCell className="font-medium">${invoice.total}</TableCell>
                  <TableCell>{format(new Date(invoice.dueDate), "MMM dd, yyyy")}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(invoice.status)}
                      <Select
                        value={invoice.status}
                        onValueChange={(val) => updateStatusMutation.mutate({ id: invoice.id, status: val })}
                      >
                        <SelectTrigger className="w-[120px] h-8 text-sm font-medium transition-all hover:border-gray-400 focus:ring-2 focus:ring-blue-500/20">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className="border border-gray-200 shadow-lg animate-in fade-in-50 zoom-in-95 duration-200">
                          <SelectItem value="paid" className="text-green-600 hover:text-green-700 hover:bg-green-50 cursor-pointer">Paid</SelectItem>
                          <SelectItem value="pending" className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 cursor-pointer">Pending</SelectItem>
                          <SelectItem value="overdue" className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer">Overdue</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="hover:bg-gray-100 transition-colors duration-200"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent 
                        align="end"
                        className="w-48 p-2 bg-white shadow-lg rounded-lg border border-gray-200 animate-in fade-in-50 zoom-in-95 duration-200"
                      >
                        <DropdownMenuItem 
                          onClick={() => handleEdit(invoice)}
                          className="flex items-center px-3 py-2 hover:bg-blue-50 text-gray-700 hover:text-blue-600 rounded-md transition-colors duration-150"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDownloadPDF(invoice)}
                          className="flex items-center px-3 py-2 hover:bg-blue-50 text-gray-700 hover:text-blue-600 rounded-md transition-colors duration-150"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          asChild
                          className="flex items-center px-3 py-2 hover:bg-blue-50 text-gray-700 hover:text-blue-600 rounded-md transition-colors duration-150"
                        >
                          <Link href={`/invoicemaker/invoices/${invoice.id}`}>
                            <div className="flex items-center">
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </div>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="my-2 border-t border-gray-100" />
                        <DropdownMenuItem 
                          onClick={() => handleDelete(invoice.id)}
                          className="flex items-center px-3 py-2 hover:bg-red-50 text-red-600 hover:text-red-700 rounded-md transition-colors duration-150"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
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