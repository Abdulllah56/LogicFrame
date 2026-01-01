import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { toast } from "sonner";
import { supabase } from "../integrations/supabase/client";

interface InvoiceFormProps {
  onInvoiceCreated: () => void;
}

export const InvoiceForm = ({ onInvoiceCreated }: InvoiceFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    amount: "",
    dueDate: "",
    description: "",
    reminderDay1: "3",
    reminderDay2: "7",
    reminderDay3: "14",
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id || null);
    });
  }, []);

  const generateInvoiceNumber = async () => {
    if (!userId) return `INV-001`;

    const { count } = await supabase
      .from("invoices")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    const nextNumber = (count || 0) + 1;
    return `INV-${String(nextNumber).padStart(3, "0")}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.clientEmail)) {
        toast.error("Please enter a valid email address");
        setIsSubmitting(false);
        return;
      }

      // Validate amount
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        toast.error("Amount must be greater than 0");
        setIsSubmitting(false);
        return;
      }

      // Generate invoice number
      const invoiceNumber = await generateInvoiceNumber();

      if (!userId) {
        toast.error("User not authenticated");
        setIsSubmitting(false);
        return;
      }

      // Insert invoice into database
      const { error } = await supabase.from("invoices").insert({
        invoice_number: invoiceNumber,
        user_id: userId,
        client_name: formData.clientName,
        client_email: formData.clientEmail,
        amount: amount,
        due_date: formData.dueDate,
        description: formData.description || null,
        reminder_day_1: parseInt(formData.reminderDay1),
        reminder_day_2: parseInt(formData.reminderDay2),
        reminder_day_3: parseInt(formData.reminderDay3),
      });

      if (error) throw error;

      toast.success(`Invoice ${invoiceNumber} created successfully!`);

      // Reset form
      setFormData({
        clientName: "",
        clientEmail: "",
        amount: "",
        dueDate: "",
        description: "",
        reminderDay1: "3",
        reminderDay2: "7",
        reminderDay3: "14",
      });

      onInvoiceCreated();
    } catch (error: any) {
      console.error("Error creating invoice:", error);
      console.error("Error message:", error.message);
      console.error("Error details:", error.details);
      console.error("Error hint:", error.hint);
      console.error("Error code:", error.code);
      toast.error(error.message || "Failed to create invoice. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Invoice</CardTitle>
        <CardDescription>Add invoice details to start automated payment reminders</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Client Name *</Label>
              <Input
                id="clientName"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                required
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientEmail">Client Email *</Label>
              <Input
                id="clientEmail"
                type="email"
                value={formData.clientEmail}
                onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                required
                placeholder="john@example.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount ($) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
                placeholder="1500.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date *</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Website design project..."
              rows={3}
            />
          </div>

          <div className="space-y-3">
            <Label>Reminder Schedule (Days After Due Date)</Label>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reminderDay1" className="text-xs">1st Reminder</Label>
                <Input
                  id="reminderDay1"
                  type="number"
                  min="0"
                  value={formData.reminderDay1}
                  onChange={(e) => setFormData({ ...formData, reminderDay1: e.target.value })}
                  placeholder="3"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reminderDay2" className="text-xs">2nd Reminder</Label>
                <Input
                  id="reminderDay2"
                  type="number"
                  min="0"
                  value={formData.reminderDay2}
                  onChange={(e) => setFormData({ ...formData, reminderDay2: e.target.value })}
                  placeholder="7"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reminderDay3" className="text-xs">3rd Reminder</Label>
                <Input
                  id="reminderDay3"
                  type="number"
                  min="0"
                  value={formData.reminderDay3}
                  onChange={(e) => setFormData({ ...formData, reminderDay3: e.target.value })}
                  placeholder="14"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Set when automatic reminders will be sent after the invoice becomes overdue
            </p>
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Creating..." : "Create Invoice"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
