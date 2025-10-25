"use client"; // Add this if using Next.js 13+ App Router

import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { invoiceFormSchema } from "../../shared/schema";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Trash2, Plus } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../hooks/useToast";

// Local storage helpers
const LS_INVOICES = 'invoicemaker_invoices';
const LS_META = 'invoicemaker_meta';

function loadInvoices() {
  try {
    const raw = localStorage.getItem(LS_INVOICES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveInvoices(list) {
  localStorage.setItem(LS_INVOICES, JSON.stringify(list));
}

function loadMeta() {
  try {
    const raw = localStorage.getItem(LS_META);
    const meta = raw ? JSON.parse(raw) : undefined;
    return meta ?? { lastInvoiceId: 0, lastInvoiceNumber: 1000 };
  } catch {
    return { lastInvoiceId: 0, lastInvoiceNumber: 1000 };
  }
}

function saveMeta(meta) {
  localStorage.setItem(LS_META, JSON.stringify(meta));
}

function nextId() {
  const meta = loadMeta();
  meta.lastInvoiceId = (meta.lastInvoiceId ?? 0) + 1;
  saveMeta(meta);
  return meta.lastInvoiceId;
}

function nextInvoiceNumber() {
  const meta = loadMeta();
  meta.lastInvoiceNumber = (meta.lastInvoiceNumber ?? 1000) + 1;
  saveMeta(meta);
  return `INV-${String(meta.lastInvoiceNumber).padStart(3, '0')}`;
}

function isoDate(input) {
  return new Date(input).toISOString();
}

export function InvoiceForm({ open, onOpenChange, invoice, mode = "create" }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      invoiceNumber: invoice?.invoiceNumber || "",
      clientName: invoice?.clientName || "",
      clientEmail: invoice?.clientEmail || "",
      projectName: invoice?.projectName || "",
      description: invoice?.description || "",
      dueDate: invoice?.dueDate ? new Date(invoice.dueDate) : new Date(),
      status: invoice?.status || "pending",
      subtotal: invoice?.subtotal || "0",
      taxRate: invoice?.taxRate || "0",
      taxAmount: invoice?.taxAmount || "0",
      total: invoice?.total || "0",
      items: invoice?.items || [{ description: "", quantity: "1", rate: "0", amount: "0" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchedItems = form.watch("items");
  const watchedTaxRate = form.watch("taxRate") || "0";

  // Reset form when invoice prop changes
  useEffect(() => {
    if (invoice && mode === "edit") {
      const formData = {
        invoiceNumber: invoice.invoiceNumber || "",
        clientName: invoice.clientName || "",
        clientEmail: invoice.clientEmail || "",
        projectName: invoice.projectName || "",
        description: invoice.description || "",
        dueDate: invoice.dueDate ? new Date(invoice.dueDate) : new Date(),
        status: invoice.status || "pending",
        subtotal: invoice.subtotal || "0",
        taxRate: invoice.taxRate || "0",
        taxAmount: invoice.taxAmount || "0",
        total: invoice.total || "0",
        items: invoice.items || [{ description: "", quantity: "1", rate: "0", amount: "0" }],
      };
      form.reset(formData);
    }
  }, [invoice, mode, form]);

  // Calculate totals automatically
  useEffect(() => {
    const subtotal = watchedItems.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const rate = parseFloat(item.rate) || 0;
      return sum + (quantity * rate);
    }, 0);

    const taxRate = parseFloat(watchedTaxRate) || 0;
    const taxAmount = (subtotal * taxRate) / 100;
    const total = subtotal + taxAmount;

    form.setValue("subtotal", subtotal.toFixed(2));
    form.setValue("taxAmount", taxAmount.toFixed(2));
    form.setValue("total", total.toFixed(2));

    // Update individual item amounts
    watchedItems.forEach((item, index) => {
      const quantity = parseFloat(item.quantity) || 0;
      const rate = parseFloat(item.rate) || 0;
      const amount = quantity * rate;
      form.setValue(`items.${index}.amount`, amount.toFixed(2));
    });
  }, [watchedItems, watchedTaxRate, form]);

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const list = loadInvoices();
      const id = nextId();
      const now = new Date().toISOString();
      const invoiceNumber = (data.invoiceNumber && data.invoiceNumber.trim()) 
        ? data.invoiceNumber 
        : nextInvoiceNumber();

      const items = (data.items || []).map((item, idx) => ({
        id: idx + 1,
        invoiceId: id,
        description: String(item.description || ""),
        quantity: String(item.quantity || 0),
        rate: String(item.rate || 0),
        amount: String(item.amount || 0),
      }));

      const newInvoice = {
        id,
        userId: 'local-user',
        invoiceNumber,
        clientName: data.clientName,
        clientEmail: data.clientEmail,
        projectName: data.projectName,
        description: data.description ?? null,
        dueDate: isoDate(data.dueDate),
        status: data.status || 'pending',
        subtotal: String(data.subtotal || 0),
        taxRate: String(data.taxRate || 0),
        taxAmount: String(data.taxAmount || 0),
        total: String(data.total || 0),
        createdAt: now,
        updatedAt: now,
        items,
      };

      list.push(newInvoice);
      saveInvoices(list);
      return newInvoice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["local/invoices"] });
      toast({
        title: "Success",
        description: "Invoice created successfully",
      });
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      const invoiceId = invoice?.id;
      if (!invoiceId) throw new Error("Invoice ID is required for updates");

      const list = loadInvoices();
      const idx = list.findIndex((inv) => inv.id === Number(invoiceId));
      if (idx === -1) throw new Error("Invoice not found");

      const existing = list[idx];
      const now = new Date().toISOString();

      const items = (data.items || []).map((item, i) => ({
        id: i + 1,
        invoiceId: Number(invoiceId),
        description: String(item.description || ""),
        quantity: String(item.quantity || 0),
        rate: String(item.rate || 0),
        amount: String(item.amount || 0),
      }));

      const updated = {
        ...existing,
        invoiceNumber: (data.invoiceNumber && data.invoiceNumber.trim()) 
          ? data.invoiceNumber 
          : existing.invoiceNumber,
        clientName: data.clientName,
        clientEmail: data.clientEmail,
        projectName: data.projectName,
        description: data.description ?? null,
        dueDate: isoDate(data.dueDate),
        status: data.status || existing.status,
        subtotal: String(data.subtotal || 0),
        taxRate: String(data.taxRate || 0),
        taxAmount: String(data.taxAmount || 0),
        total: String(data.total || 0),
        updatedAt: now,
        items,
      };

      list[idx] = updated;
      saveInvoices(list);
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["local/invoices"] });
      toast({
        title: "Success",
        description: "Invoice updated successfully",
      });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data) => {
    // Ensure we have a valid Date object for dueDate
    const submissionData = {
      ...data,
      dueDate: data.dueDate instanceof Date ? data.dueDate : new Date(data.dueDate),
    };

    if (mode === "edit") {
      updateMutation.mutate(submissionData);
    } else {
      createMutation.mutate(submissionData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-950">
        <DialogHeader className="border-b border-gray-200 dark:border-gray-800 pb-4">
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {mode === "edit" ? "Edit Invoice" : "Create New Invoice"}
          </DialogTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Fill in the information below to {mode === "edit" ? "update" : "create"} an invoice
          </p>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
          {/* Client Information */}
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm rounded-lg overflow-hidden">
            <CardHeader className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800">
              <CardTitle className="text-lg font-semibold">Client Information</CardTitle>
              <p className="text-sm text-gray-500 dark:text-gray-400">Enter your client's details</p>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientName" className="text-sm font-medium flex items-center">
                  Client Name
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="clientName"
                  {...form.register("clientName")}
                  placeholder="Enter client name"
                  className={`border-gray-200 focus:ring-2 focus:ring-[#03d0f4] focus:ring-opacity-50 focus:border-transparent transition-all
                    ${form.formState.errors.clientName ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
                {form.formState.errors.clientName && (
                  <p className="text-sm text-red-500 flex items-center">
                    <span className="mr-1">⚠</span>
                    {form.formState.errors.clientName.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientEmail" className="text-sm font-medium flex items-center">
                  Client Email
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="clientEmail"
                  type="email"
                  {...form.register("clientEmail")}
                  placeholder="client@example.com"
                  className={`border-gray-200 focus:ring-2 focus:ring-[#03d0f4] focus:ring-opacity-50 focus:border-transparent transition-all
                    ${form.formState.errors.clientEmail ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
                {form.formState.errors.clientEmail && (
                  <p className="text-sm text-red-500 flex items-center">
                    <span className="mr-1">⚠</span>
                    {form.formState.errors.clientEmail.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Project Information */}
          <Card>
            <CardHeader>
              <CardTitle>Project Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="invoiceNumber">Invoice Number</Label>
                  <Input
                    id="invoiceNumber"
                    {...form.register("invoiceNumber")}
                    placeholder="Auto-generated"
                    readOnly={mode === "create"}
                    className={mode === "create" ? "bg-muted" : ""}
                  />
                  {form.formState.errors.invoiceNumber && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.invoiceNumber.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="projectName">Project Name</Label>
                  <Input
                    id="projectName"
                    {...form.register("projectName")}
                    placeholder="Enter project name"
                  />
                  {form.formState.errors.projectName && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.projectName.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    {...form.register("dueDate")}
                    type="date"
                    value={
                      form.watch("dueDate")
                        ? new Date(form.watch("dueDate")).toISOString().split('T')[0]
                        : new Date().toISOString().split('T')[0]
                    }
                    onChange={(e) => {
                      const date = new Date(e.target.value);
                      if (!isNaN(date.getTime())) {
                        form.setValue("dueDate", date);
                      }
                    }}
                  />
                  {form.formState.errors.dueDate && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.dueDate.message}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="description">Project Description</Label>
                <Textarea
                  id="description"
                  {...form.register("description")}
                  placeholder="Describe the project or services provided..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Service Items */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Service Items</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ description: "", quantity: "1", rate: "0", amount: "0" })}
                  className="border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2 text-[#03d0f4]" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg">
                  <div className="md:col-span-2">
                    <Label>Description</Label>
                    <Input
                      {...form.register(`items.${index}.description`)}
                      placeholder="Service description"
                    />
                  </div>
                  <div>
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      step="0.01"
                      {...form.register(`items.${index}.quantity`)}
                      placeholder="Qty"
                    />
                  </div>
                  <div>
                    <Label>Rate</Label>
                    <Input
                      type="number"
                      step="0.01"
                      {...form.register(`items.${index}.rate`)}
                      placeholder="Rate"
                    />
                  </div>
                  <div className="flex items-end space-x-2">
                    <div className="flex-1">
                      <Label>Amount</Label>
                      <Input
                        {...form.register(`items.${index}.amount`)}
                        readOnly
                        className="bg-muted"
                      />
                    </div>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => remove(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Tax and Totals */}
          <Card>
            <CardHeader>
              <CardTitle>Tax & Totals</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="taxRate">Tax Rate (%)</Label>
                <Input
                  id="taxRate"
                  type="number"
                  step="0.01"
                  {...form.register("taxRate")}
                  placeholder="0.00"
                />
              </div>
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>${form.watch("subtotal")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax:</span>
                  <span>${form.watch("taxAmount")}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold border-t pt-2">
                  <span>Total:</span>
                  <span>${form.watch("total")}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-6 mt-6 border-t border-gray-200 dark:border-gray-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="px-6 border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="px-6 bg-[#03d0f4] hover:bg-[#02b8d8] text-white transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createMutation.isPending || updateMutation.isPending ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </div>
              ) : 'Save Invoice'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}