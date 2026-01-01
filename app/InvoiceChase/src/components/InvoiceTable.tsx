import { useState } from "react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { CheckCircle, Trash2, Download, Mail, MoreHorizontal, Pencil, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "../integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";

interface Invoice {
  id: number;
  invoice_number: string;
  client_name: string;
  client_email: string;
  amount: number;
  due_date: string;
  description: string | null;
  status: string;
  reminders_sent: number;
  created_at: string;
  reminder_day_1?: number;
  reminder_day_2?: number;
  reminder_day_3?: number;
}

interface InvoiceTableProps {
  invoices: Invoice[];
  onUpdate: () => void;
}

export const InvoiceTable = ({ invoices, onUpdate }: InvoiceTableProps) => {
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const calculateDaysOverdue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusBadge = (invoice: Invoice) => {
    if (invoice.status === "paid") {
      return <Badge className="bg-green-500 hover:bg-green-600">Paid</Badge>;
    }
    if (invoice.status === "cancelled") {
      return <Badge variant="secondary" className="bg-muted text-muted-foreground">Cancelled</Badge>;
    }

    const daysOverdue = calculateDaysOverdue(invoice.due_date);
    if (daysOverdue > 0 && invoice.status !== "paid") {
      return (
        <div className="flex flex-col gap-1">
          <Badge variant="destructive">Overdue</Badge>
          <span className="text-xs text-destructive">{daysOverdue} days</span>
        </div>
      );
    }

    return <Badge variant="secondary" className="bg-pending text-pending-foreground hover:bg-pending">Pending</Badge>;
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("invoices")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;

      toast.success(`Invoice status updated to ${newStatus}`);
      // Add a small delay to ensure DB propagation or just call immediately
      onUpdate();
    } catch (error) {
      console.error("Error updating invoice status:", error);
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id: number, invoiceNumber: string) => {
    try {
      const { error } = await supabase
        .from("invoices")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success(`Invoice ${invoiceNumber} deleted`);
      onUpdate();
    } catch (error) {
      console.error("Error deleting invoice:", error);
      toast.error("Failed to delete invoice");
    }
  };

  const handleUpdateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInvoice) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("invoices")
        .update({
          client_name: editingInvoice.client_name,
          client_email: editingInvoice.client_email,
          amount: editingInvoice.amount,
          due_date: editingInvoice.due_date,
          description: editingInvoice.description
        })
        .eq("id", editingInvoice.id);

      if (error) throw error;

      toast.success("Invoice updated successfully");
      setEditingInvoice(null);
      onUpdate();
    } catch (error) {
      console.error("Error updating invoice:", error);
      toast.error("Failed to update invoice");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendTestEmail = async (invoice: Invoice) => {
    const toastId = toast.loading("Sending email...");

    try {
      const daysOverdue = calculateDaysOverdue(invoice.due_date);

      let reminderType: 'friendly' | 'firm' | 'final';
      if (daysOverdue <= 0 || invoice.reminders_sent === 0) {
        reminderType = 'friendly';
      } else if (invoice.reminders_sent === 1) {
        reminderType = 'firm';
      } else {
        reminderType = 'final';
      }

      // Call our Next.js API route
      const response = await fetch('/api/send-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: invoice.id,
          reminderType,
          daysOverdue: Math.max(0, daysOverdue),
          customSubject: `Reminder: Invoice #${invoice.invoice_number}`,
          customBody: `This is a manual reminder for invoice #${invoice.invoice_number}.`
        }),
      });

      if (!response.ok) throw new Error("Failed to send email");

      toast.success(`Email sent to ${invoice.client_email}!`, { id: toastId });
      onUpdate();
    } catch (error) {
      console.error("Error sending test email:", error);
      toast.error("Failed to send email", { id: toastId });
    }
  };

  const handleExport = () => {
    if (invoices.length === 0) {
      toast.error("No invoices to export");
      return;
    }

    const headers = [
      "Invoice Number", "Client Name", "Client Email", "Amount", "Due Date",
      "Status", "Days Overdue", "Reminders Sent", "Description", "Created At"
    ];

    const rows = invoices.map(invoice => {
      const daysOverdue = calculateDaysOverdue(invoice.due_date);
      return [
        invoice.invoice_number,
        invoice.client_name,
        invoice.client_email,
        invoice.amount,
        invoice.due_date,
        invoice.status,
        daysOverdue > 0 ? daysOverdue : 0,
        invoice.reminders_sent,
        invoice.description || "",
        new Date(invoice.created_at).toLocaleDateString()
      ];
    });

    const csvContent = [headers.join(","), ...rows.map(row => row.map(cell => typeof cell === 'string' && (cell.includes(',') || cell.includes('"')) ? `"${cell.replace(/"/g, '""')}"` : cell).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `invoices_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Invoices exported successfully!");
  };

  if (invoices.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-muted-foreground">No invoices yet. Create your first invoice above!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Invoices</CardTitle>
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reminders</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{invoice.client_name}</div>
                      <div className="text-sm text-muted-foreground">{invoice.client_email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                  <TableCell>{formatDate(invoice.due_date)}</TableCell>
                  <TableCell>{getStatusBadge(invoice)}</TableCell>
                  <TableCell>{invoice.reminders_sent}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2 items-center">
                      {invoice.status !== "paid" && invoice.status !== "cancelled" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.location.assign(`/InvoiceChase/send-email/${invoice.invoice_number}`)}
                          className="flex shrink-0"
                        >
                          <Mail className="h-4 w-4 mr-1" />
                          Send Reminder
                        </Button>
                      )}

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => setEditingInvoice(invoice)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit Invoice
                          </DropdownMenuItem>

                          {/* Mobile only reminder button */}
                          {invoice.status !== "paid" && invoice.status !== "cancelled" && (
                            <DropdownMenuItem
                              onClick={() => window.location.assign(`/InvoiceChase/send-email/${invoice.invoice_number}`)}
                              className="sm:hidden"
                            >
                              <Mail className="mr-2 h-4 w-4" />
                              Send Reminder
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuSeparator />
                          <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleStatusChange(invoice.id, 'paid')}>
                            <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                            Mark Paid
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(invoice.id, 'unpaid')}>
                            <Clock className="mr-2 h-4 w-4 text-yellow-500" />
                            Mark Pending
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(invoice.id, 'cancelled')}>
                            <XCircle className="mr-2 h-4 w-4 text-red-500" />
                            Cancel Invoice
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Invoice
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Invoice?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete {invoice.invoice_number}.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(invoice.id, invoice.invoice_number)} className="bg-destructive">
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Invoice Dialog */}
      <Dialog open={!!editingInvoice} onOpenChange={(open) => !open && setEditingInvoice(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Invoice {editingInvoice?.invoice_number}</DialogTitle>
            <DialogDescription>
              Make changes to the invoice details here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          {editingInvoice && (
            <form onSubmit={handleUpdateInvoice} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Client Name</Label>
                <Input
                  id="edit-name"
                  value={editingInvoice.client_name}
                  onChange={(e) => setEditingInvoice({ ...editingInvoice, client_name: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-email">Client Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editingInvoice.client_email}
                  onChange={(e) => setEditingInvoice({ ...editingInvoice, client_email: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-amount">Amount</Label>
                  <Input
                    id="edit-amount"
                    type="number"
                    step="0.01"
                    value={editingInvoice.amount}
                    onChange={(e) => setEditingInvoice({ ...editingInvoice, amount: parseFloat(e.target.value) })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-date">Due Date</Label>
                  <Input
                    id="edit-date"
                    type="date"
                    value={editingInvoice.due_date}
                    onChange={(e) => setEditingInvoice({ ...editingInvoice, due_date: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-desc">Description</Label>
                <Textarea
                  id="edit-desc"
                  value={editingInvoice.description || ''}
                  onChange={(e) => setEditingInvoice({ ...editingInvoice, description: e.target.value })}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditingInvoice(null)}>Cancel</Button>
                <Button type="submit" disabled={isSaving}>{isSaving ? "Saving..." : "Save Changes"}</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
