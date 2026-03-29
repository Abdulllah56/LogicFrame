"use client";

import { useEffect } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { invoiceFormSchema } from "../../shared/schema";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Switch } from "./ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Trash2, Plus, User, Mail, Briefcase, Calendar, Hash, Building2, MapPin, Repeat, FileText, Bell, Zap } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useInvoices } from "../hooks/useInvoices";
import { useRouter } from "next/navigation";

export function InvoiceForm({ open, onOpenChange, invoice, mode = "create", isPage = false }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { saveInvoice, updateInvoice } = useInvoices();

  const form = useForm({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      invoiceNumber: invoice?.invoiceNumber || "",
      customPrefix: invoice?.customPrefix || "",
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
      isRecurring: invoice?.isRecurring || false,
      frequency: invoice?.frequency || "monthly",
      notes: invoice?.notes || "",
      paymentInstructions: invoice?.paymentInstructions || "",
      autoChase: invoice?.autoChase || false,
      lateFeePercent: invoice?.lateFeePercent || "0",
      lateFeeDays: invoice?.lateFeeDays || "0",
    },
  });

  // Hook initialized at line 20

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // watchedItems moved down near calculation for clarity

  // Reset form when invoice prop changes
  useEffect(() => {
    if (invoice && mode === "edit") {
      const formData = {
        id: invoice.id,
        invoiceNumber: invoice.invoice_number || invoice.invoiceNumber || "",
        customPrefix: invoice.custom_prefix || invoice.customPrefix || "",
        businessName: invoice.business_name || invoice.businessName || "",
        businessEmail: invoice.business_email || invoice.businessEmail || "",
        businessCity: invoice.business_city || invoice.businessCity || "",
        clientName: invoice.client_name || invoice.clientName || "",
        clientEmail: invoice.client_email || invoice.clientEmail || "",
        projectName: invoice.project_name || invoice.projectName || "",
        description: invoice.description || "",
        dueDate: invoice.due_date ? new Date(invoice.due_date) : new Date(),
        status: invoice.status || "pending",
        subtotal: String(invoice.subtotal || "0"),
        taxRate: String(invoice.tax_rate || invoice.taxRate || "0"),
        taxAmount: String(invoice.tax_amount || invoice.taxAmount || "0"),
        total: String(invoice.total || "0"),
        items: invoice.items || [{ description: "", quantity: "1", rate: "0", amount: "0" }],
        isRecurring: invoice.is_recurring || invoice.isRecurring || false,
        frequency: invoice.frequency || "monthly",
        notes: invoice.notes || "",
        paymentInstructions: invoice.payment_instructions || invoice.paymentInstructions || "",
        autoChase: invoice.auto_chase || invoice.autoChase || false,
        lateFeePercent: String(invoice.late_fee_percent || invoice.lateFeePercent || "0"),
        lateFeeDays: String(invoice.late_fee_days || invoice.lateFeeDays || "0"),
      };
      form.reset(formData);
    } else {
      form.reset({
        invoiceNumber: "",
        customPrefix: "",
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
        isRecurring: false,
        frequency: "monthly",
        notes: "",
        paymentInstructions: "",
        autoChase: false,
        lateFeePercent: "0",
        lateFeeDays: "0",
      });
    }
  }, [invoice, mode, form, open]);

  const watchedItems = useWatch({
    control: form.control,
    name: "items",
  });
  const watchedTaxRate = useWatch({
    control: form.control,
    name: "taxRate",
    defaultValue: "0",
  });

  // Calculate totals automatically based on watched items and tax rate (NOT via useEffect as it causes loops)
  const totals = (watchedItems || []).reduce((acc, item) => {
    const qty = parseFloat(item.quantity) || 0;
    const rate = parseFloat(item.rate) || 0;
    const amount = qty * rate;
    acc.subtotal += amount;
    acc.itemAmounts.push(amount.toFixed(2));
    return acc;
  }, { subtotal: 0, itemAmounts: [] });

  const taxRateVal = parseFloat(watchedTaxRate) || 0;
  const taxAmountVal = (totals.subtotal * taxRateVal) / 100;
  const totalVal = totals.subtotal + taxAmountVal;

  const displayTotals = {
    subtotal: totals.subtotal.toFixed(2),
    taxAmount: taxAmountVal.toFixed(2),
    total: totalVal.toFixed(2),
    itemAmounts: totals.itemAmounts
  };

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
      if (isPage) {
        router.push("/invoicemaker/invoices");
      } else if (onOpenChange) {
        onOpenChange(false);
      }
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
      if (isPage) {
        router.push("/invoicemaker/invoices");
      } else if (onOpenChange) {
        onOpenChange(false);
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data) => {
    const submissionData = {
      ...data,
      dueDate: data.dueDate instanceof Date ? data.dueDate : new Date(data.dueDate),
      subtotal: displayTotals.subtotal,
      taxAmount: displayTotals.taxAmount,
      total: displayTotals.total,
      items: (data.items || []).map((item, idx) => ({
        ...item,
        amount: displayTotals.itemAmounts[idx]
      }))
    };

    try {
      if (mode === "edit") {
        await updateInvoice(invoice.id, submissionData);
      } else {
        await saveInvoice(submissionData);
      }
      
      if (isPage) {
        router.push("/invoicemaker/invoices");
      } else if (onOpenChange) {
        onOpenChange(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancel = () => {
    if (isPage) {
      router.back();
    } else if (onOpenChange) {
      onOpenChange(false);
    }
  };

  const formContent = (
    <div className={isPage ? "max-w-5xl mx-auto py-8 px-4" : "py-4"}>
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          {mode === "edit" ? "Edit Invoice" : "Create New Invoice"}
        </h1>
        <p className="text-muted-foreground">
          {mode === "edit" ? "Update your invoice details below." : "Fill in the details to generate a professional invoice."}
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
              {/* Header labels for service items */}
              <div className="hidden md:grid grid-cols-5 gap-4 px-1 mb-2">
                <div className="col-span-2 text-sm font-semibold text-muted-foreground">Description</div>
                <div className="text-sm font-semibold text-muted-foreground">Quantity</div>
                <div className="text-sm font-semibold text-muted-foreground">Rate</div>
                <div className="text-sm font-semibold text-muted-foreground">Amount</div>
              </div>
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
                    <div className="flex-1 px-3 py-2 border rounded-md bg-muted text-sm text-foreground">
                      {displayTotals.itemAmounts[index] || "0.00"}
                    </div>
                    <input
                      type="hidden"
                      {...form.register(`items.${index}.amount`)}
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

          {/* Advanced Features Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="recent-invoices-card">
              <CardHeader className="pb-3 border-b border-white/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Repeat className="w-4 h-4 text-primary" />
                    <CardTitle className="text-sm font-bold">Recurring Billing</CardTitle>
                  </div>
                  <Switch 
                    checked={form.watch("isRecurring")} 
                    onCheckedChange={(val) => form.setValue("isRecurring", val)}
                  />
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                {form.watch("isRecurring") ? (
                  <div className="space-y-3">
                    <Label className="text-xs">Frequency</Label>
                    <Select value={form.watch("frequency")} onValueChange={(v) => form.setValue("frequency", v)}>
                      <SelectTrigger className="bg-background/50 border-white/10">
                        <SelectValue placeholder="Select Frequency" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-white/10">
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    Great for monthly retainers. Next invoice generates automatically.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="recent-invoices-card">
              <CardHeader className="pb-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  <CardTitle className="text-sm font-bold">Advanced Controls</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs flex items-center gap-2">
                    <Hash className="w-3 h-3" /> Custom Prefix
                  </Label>
                  <Input {...form.register("customPrefix")} placeholder="e.g. ACM-2026-" className="bg-background/50 border-white/10 h-8" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-xs flex items-center gap-2">
                      <Bell className="w-3 h-3" /> Smart Follow-up
                    </Label>
                    <p className="text-[10px] text-muted-foreground">Auto-track in Payment Chase</p>
                  </div>
                  <Switch 
                    checked={form.watch("autoChase")} 
                    onCheckedChange={(val) => form.setValue("autoChase", val)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Notes Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 recent-invoices-card p-4 rounded-lg bg-background/30 border border-white/5">
              <Label className="flex items-center gap-2 text-sm font-bold">
                <FileText className="w-4 h-4 text-primary" /> Extra Notes / Terms
              </Label>
              <Textarea 
                {...form.register("notes")} 
                placeholder="e.g. 'Payment due within 14 days'" 
                className="min-h-[100px] bg-background/50 border-white/10"
              />
            </div>
            <div className="space-y-2 recent-invoices-card p-4 rounded-lg bg-background/30 border border-white/5">
              <Label className="flex items-center gap-2 text-sm font-bold">
                <Building2 className="w-4 h-4 text-primary" /> Payment Instructions
              </Label>
              <Textarea 
                {...form.register("paymentInstructions")} 
                placeholder="e.g. 'Bank Transfer: logicframe-xxxxxxx'" 
                className="min-h-[100px] bg-background/50 border-white/10"
              />
            </div>
          </div>

          {/* Late Fee calculator card */}
          <Card className="recent-invoices-card border-dashed border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="space-y-1">
                  <h4 className="font-bold text-sm">Late Fee Auto-Calculator</h4>
                  <p className="text-xs text-muted-foreground">Automatically adds a penalty if unpaid after grace period.</p>
                </div>
                <Switch 
                  checked={form.watch("lateFeePercent") !== "0"} 
                  onCheckedChange={(checked) => {
                    form.setValue("lateFeePercent", checked ? "2" : "0");
                    form.setValue("lateFeeDays", checked ? "30" : "0");
                  }} 
                />
              </div>
              {form.watch("lateFeePercent") !== "0" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Fee Percentage (%)</Label>
                    <Input type="number" {...form.register("lateFeePercent")} className="bg-background/50 border-white/10" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Grace Period (Days)</Label>
                    <Input type="number" {...form.register("lateFeeDays")} className="bg-background/50 border-white/10" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tax and Totals */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <Card className="recent-invoices-card">
              <CardHeader>
                <CardTitle>Tax & Discounts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="taxRate">Tax Rate (%)</Label>
                    <div className="relative">
                      <Input
                        id="taxRate"
                        type="number"
                        step="0.01"
                        {...form.register("taxRate")}
                        placeholder="0.00"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="recent-invoices-card p-6 rounded-lg space-y-4">
              <div className="flex justify-between text-lg">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-semibold text-foreground">${displayTotals.subtotal}</span>
              </div>
              <div className="flex justify-between text-lg">
                <span className="text-muted-foreground">Tax:</span>
                <span className="font-semibold text-foreground">${displayTotals.taxAmount}</span>
              </div>
              <div className="flex justify-between text-2xl font-bold border-t border-border pt-4 mt-4">
                <span className="text-foreground">Total:</span>
                <span className="text-primary">${displayTotals.total}</span>
              </div>
              <input type="hidden" {...form.register("subtotal")} />
              <input type="hidden" {...form.register("taxAmount")} />
              <input type="hidden" {...form.register("total")} />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-6 mt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
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
    </div>
  );

  if (isPage) return formContent;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto modal-bg">
        {formContent}
      </DialogContent>
    </Dialog>
  );
}