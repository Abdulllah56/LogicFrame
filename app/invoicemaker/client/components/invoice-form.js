"use client";

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
import { Trash2, Plus, User, Mail, Briefcase, Calendar, Hash, Building2, MapPin } from "lucide-react";
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
      businessName: invoice?.businessName || "",
      businessEmail: invoice?.businessEmail || "",
      businessCity: invoice?.businessCity || "",
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
        businessName: invoice.businessName || "",
        businessEmail: invoice.businessEmail || "",
        businessCity: invoice.businessCity || "",
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
    } else {
      form.reset({
        invoiceNumber: "",
        businessName: "",
        businessEmail: "",
        businessCity: "",
        clientName: "",
        clientEmail: "",
        projectName: "",
        description: "",
        dueDate: new Date(),
        status: "pending",
        subtotal: "0",
        taxRate: "0",
        taxAmount: "0",
        total: "0",
        items: [{ description: "", quantity: "1", rate: "0", amount: "0" }],
      });
    }
  }, [invoice, mode, form, open]);

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
        businessName: data.businessName,
        businessEmail: data.businessEmail,
        businessCity: data.businessCity,
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
        businessName: data.businessName,
        businessEmail: data.businessEmail,
        businessCity: data.businessCity,
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto modal-bg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {mode === "edit" ? "Edit Invoice" : "Create New Invoice"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 py-4">
          {/* Row 1: Business Info & Invoice Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="recent-invoices-card">
              <CardHeader>
                <CardTitle>Your Business Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                  <Input
                    {...form.register("businessName")}
                    placeholder="Business Name"
                    className="pl-10"
                  />
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                  <Input
                    type="email"
                    {...form.register("businessEmail")}
                    placeholder="Business Email"
                    className="pl-10"
                  />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                  <Input
                    {...form.register("businessCity")}
                    placeholder="City"
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="recent-invoices-card">
              <CardHeader>
                <CardTitle>Invoice Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                  <Input
                    {...form.register("invoiceNumber")}
                    placeholder="Invoice Number (auto-generated)"
                    readOnly={mode === "create"}
                    className="pl-10"
                  />
                </div>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                  <Input
                    type="date"
                    {...form.register("dueDate")}
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
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Row 2: Client Info & Project Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="recent-invoices-card">
              <CardHeader>
                <CardTitle>Client Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                  <Input
                    {...form.register("clientName")}
                    placeholder="Client Name"
                    className="pl-10"
                  />
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                  <Input
                    type="email"
                    {...form.register("clientEmail")}
                    placeholder="Client Email"
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="recent-invoices-card">
              <CardHeader>
                <CardTitle>Project Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                  <Input
                    {...form.register("projectName")}
                    placeholder="Project Name"
                    className="pl-10"
                  />
                </div>
                <Textarea
                  {...form.register("description")}
                  placeholder="Project Description..."
                  rows={3}
                  className="resize-none"
                />
              </CardContent>
            </Card>
          </div>

          {/* Service Items */}
          <Card className="recent-invoices-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Service Items</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ description: "", quantity: "1", rate: "0", amount: "0" })}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                  <div className="md:col-span-2">
                    <Input
                      {...form.register(`items.${index}.description`)}
                      placeholder="Service description"
                    />
                  </div>
                  <div>
                    <Input
                      type="number"
                      step="0.01"
                      {...form.register(`items.${index}.quantity`)}
                      placeholder="Quantity"
                    />
                  </div>
                  <div>
                    <Input
                      type="number"
                      step="0.01"
                      {...form.register(`items.${index}.rate`)}
                      placeholder="Rate"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      {...form.register(`items.${index}.amount`)}
                      readOnly
                      className="bg-muted"
                      placeholder="Amount"
                    />
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        className="text-red-500 hover:bg-red-100"
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <Card className="recent-invoices-card">
              <CardHeader>
                <CardTitle>Tax</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Input
                    id="taxRate"
                    type="number"
                    step="0.01"
                    {...form.register("taxRate")}
                    placeholder="Tax Rate (%)"
                  />
                </div>
              </CardContent>
            </Card>
            <div className="recent-invoices-card p-6 rounded-lg space-y-4">
              <div className="flex justify-between text-lg">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-semibold text-foreground">${form.watch("subtotal")}</span>
              </div>
              <div className="flex justify-between text-lg">
                <span className="text-muted-foreground">Tax:</span>
                <span className="font-semibold text-foreground">${form.watch("taxAmount")}</span>
              </div>
              <div className="flex justify-between text-2xl font-bold border-t border-border pt-4 mt-4">
                <span className="text-foreground">Total:</span>
                <span className="text-primary">${form.watch("total")}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-6 mt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="common-button"
            >
              {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save Invoice"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}