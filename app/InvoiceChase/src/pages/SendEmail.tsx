import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../integrations/supabase/client";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { ArrowLeft, Send, Eye } from "lucide-react";
import { ThemeToggle } from "../components/ThemeToggle";
import { toast } from "sonner";
import { User } from "@supabase/supabase-js";
import { SEO } from "../components/SEO";

interface Invoice {
  id: number;
  invoice_number: string;
  client_name: string;
  client_email: string;
  amount: number;
  due_date: string;
  description: string | null;
  status: string;
}

const getDefaultTemplate = (
  type: 'friendly' | 'firm' | 'final',
  invoice: Invoice | null,
  daysOverdue: number
) => {
  if (!invoice) return { subject: '', body: '' };

  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(invoice.amount);

  const formattedDate = new Date(invoice.due_date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  if (type === 'friendly') {
    return {
      subject: `Friendly Reminder: Invoice #${invoice.invoice_number} Payment`,
      body: `Hi ${invoice.client_name},

I hope this message finds you well!

I wanted to send a quick reminder that Invoice #${invoice.invoice_number} for ${formattedAmount} was due on ${formattedDate}.

If you've already processed the payment, please disregard this message. Otherwise, I'd greatly appreciate payment at your earliest convenience.

Invoice Details:
• Invoice Number: #${invoice.invoice_number}
• Amount Due: ${formattedAmount}
• Original Due Date: ${formattedDate}
${invoice.description ? `• Description: ${invoice.description}` : ''}

If you have any questions about this invoice or need alternative payment arrangements, please don't hesitate to reach out.

Thank you for your business!

Best regards`
    };
  }

  if (type === 'firm') {
    return {
      subject: `Payment Required: Invoice #${invoice.invoice_number} - ${daysOverdue} Days Overdue`,
      body: `Hi ${invoice.client_name},

Invoice #${invoice.invoice_number} for ${formattedAmount} is now ${daysOverdue} days overdue (due date: ${formattedDate}).

Please process payment within the next 48 hours to avoid late fees.

Invoice Details:
• Invoice Number: #${invoice.invoice_number}
• Amount: ${formattedAmount}
• Days Overdue: ${daysOverdue}
• Original Due Date: ${formattedDate}

If there's an issue preventing payment, please contact me immediately.

Best regards`
    };
  }

  // Final notice
  return {
    subject: `FINAL NOTICE: Invoice #${invoice.invoice_number} - Immediate Payment Required`,
    body: `FINAL NOTICE

Hi ${invoice.client_name},

This is a final notice that invoice #${invoice.invoice_number} for ${formattedAmount} is now ${daysOverdue} days overdue.

Payment must be received immediately to avoid further action, including:
• Late payment fees
• Suspension of services
• Escalation to collections

Invoice Details:
• Invoice Number: #${invoice.invoice_number}
• Amount: ${formattedAmount}
• Days Overdue: ${daysOverdue}
• Original Due Date: ${formattedDate}

Please remit payment today or contact me immediately if there are extenuating circumstances.

Sincerely`
  };
};

const SendEmail = () => {
  const navigate = useNavigate();
  const { invoiceNumber } = useParams();

  const [user, setUser] = useState<User | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [reminderType, setReminderType] = useState<'friendly' | 'firm' | 'final'>('friendly');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });
  }, [navigate]);

  useEffect(() => {
    const fetchInvoices = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .eq("user_id", user.id)
        .in("status", ["unpaid", "pending"])
        .order("due_date", { ascending: true });

      if (error) {
        console.error("Error fetching invoices:", error);
        return;
      }

      setInvoices(data || []);
      setIsLoading(false);

      // Auto-select invoice from URL param (invoiceNumber)
      if (invoiceNumber && data) {
        const invoice = data.find(inv => inv.invoice_number === invoiceNumber);
        if (invoice) {
          setSelectedInvoice(invoice);
        }
      }
    };

    fetchInvoices();
  }, [user, invoiceNumber]);

  const calculateDaysOverdue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  useEffect(() => {
    if (selectedInvoice) {
      const daysOverdue = calculateDaysOverdue(selectedInvoice.due_date);
      const template = getDefaultTemplate(reminderType, selectedInvoice, daysOverdue);
      setSubject(template.subject);
      setBody(template.body);
    }
  }, [selectedInvoice, reminderType]);

  const handleInvoiceSelect = (invoiceId: string) => {
    const invoice = invoices.find(inv => inv.id === parseInt(invoiceId));
    setSelectedInvoice(invoice || null);
  };

  const handleSendEmail = async () => {
    if (!selectedInvoice) {
      toast.error("Please select an invoice");
      return;
    }

    setIsSending(true);
    const toastId = toast.loading("Sending email...");

    try {
      const daysOverdue = calculateDaysOverdue(selectedInvoice.due_date);

      // Call our Next.js API route instead of Supabase Edge Function
      const response = await fetch('/api/send-reminder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoiceId: selectedInvoice.id,
          reminderType,
          daysOverdue,
          customSubject: subject,
          customBody: body,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send email");
      }

      toast.success(`Email sent to ${selectedInvoice.client_email}!`, { id: toastId });
      navigate("/");
    } catch (error: any) {
      console.error("Error sending email:", error);
      toast.error(error.message || "Failed to send email. Please check your email settings.", { id: toastId });
    } finally {
      setIsSending(false);
    }
  };

  const convertToHtml = (text: string) => {
    return text
      .split('\n')
      .map(line => `<p style="margin: 0 0 10px 0; line-height: 1.6;">${line || '&nbsp;'}</p>`)
      .join('');
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center" role="status" aria-label="Loading">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Send Invoice Reminder"
        description="Compose and send professional invoice payment reminders to your clients. Choose from friendly, firm, or final notice templates."
        canonicalUrl="/send-email"
        keywords="send invoice reminder, payment reminder email, invoice follow up, collection email, payment request email"
        noIndex={true}
      />

      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background z-[-1]"></div>
      <div className="fixed w-[300px] h-[300px] bg-primary/20 rounded-full blur-[80px] opacity-30 top-[10%] left-[10%] animate-pulse z-[-1]"></div>
      <div className="fixed w-[400px] h-[400px] bg-primary/10 rounded-full blur-[80px] opacity-30 bottom-[10%] right-[10%] animate-pulse z-[-1]"></div>

      <div className="min-h-screen relative">
        <main id="main-content" className="container mx-auto py-8 px-4 max-w-4xl">
          {/* Header */}
          <header className="flex items-center justify-between mb-8" role="banner">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/")}
                aria-label="Go back to dashboard"
              >
                <ArrowLeft className="h-5 w-5" aria-hidden="true" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-primary">Send Email</h1>
                <p className="text-muted-foreground">Compose and send invoice reminders</p>
              </div>
            </div>
            <ThemeToggle />
          </header>

          <div className="grid gap-6">
            {/* Invoice Selection */}
            <Card className="border-primary/20 bg-card/50 backdrop-blur-sm shadow-xl shadow-primary/5">
              <CardHeader>
                <CardTitle>Select Invoice</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="invoice-select">Invoice</Label>
                    <Select
                      value={selectedInvoice?.id.toString() || ''}
                      onValueChange={handleInvoiceSelect}
                    >
                      <SelectTrigger id="invoice-select" aria-label="Select an invoice">
                        <SelectValue placeholder="Select an invoice" />
                      </SelectTrigger>
                      <SelectContent>
                        {invoices.map((invoice) => (
                          <SelectItem key={invoice.id} value={invoice.id.toString()}>
                            #{invoice.invoice_number} - {invoice.client_name} (${invoice.amount})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reminder-type">Reminder Type</Label>
                    <Select
                      value={reminderType}
                      onValueChange={(v) => setReminderType(v as 'friendly' | 'firm' | 'final')}
                    >
                      <SelectTrigger id="reminder-type" aria-label="Select reminder type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="friendly">Friendly Reminder</SelectItem>
                        <SelectItem value="firm">Firm Notice</SelectItem>
                        <SelectItem value="final">Final Notice</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {selectedInvoice && (
                  <aside className="p-4 rounded-lg bg-muted/50 text-sm" aria-label="Selected invoice details">
                    <p><strong>Client:</strong> {selectedInvoice.client_name}</p>
                    <p><strong>Email:</strong> {selectedInvoice.client_email}</p>
                    <p><strong>Amount:</strong> ${selectedInvoice.amount}</p>
                    <p><strong>Due Date:</strong> {new Date(selectedInvoice.due_date).toLocaleDateString()}</p>
                  </aside>
                )}
              </CardContent>
            </Card>

            {/* Email Composer */}
            <Card className="border-primary/20 bg-card/50 backdrop-blur-sm shadow-xl shadow-primary/5">
              <CardHeader>
                <CardTitle>Email Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Email subject"
                    aria-describedby="subject-description"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="body">Message</Label>
                  <Textarea
                    id="body"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Email body"
                    className="min-h-[300px] font-mono text-sm"
                    aria-describedby="body-description"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowPreview(!showPreview)}
                    disabled={!selectedInvoice}
                    aria-expanded={showPreview}
                    aria-controls="email-preview"
                  >
                    <Eye className="mr-2 h-4 w-4" aria-hidden="true" />
                    {showPreview ? 'Hide Preview' : 'Preview Email'}
                  </Button>
                  <Button
                    onClick={handleSendEmail}
                    disabled={!selectedInvoice || isSending}
                    className="flex-1"
                    aria-describedby="send-button-description"
                  >
                    <Send className="mr-2 h-4 w-4" aria-hidden="true" />
                    {isSending ? 'Sending...' : 'Send Email'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            {showPreview && selectedInvoice && (
              <Card id="email-preview">
                <CardHeader>
                  <CardTitle>Email Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <article className="border rounded-lg p-6 bg-card" aria-label="Email preview">
                    <header className="mb-4 pb-4 border-b">
                      <p className="text-sm text-muted-foreground">To: {selectedInvoice.client_email}</p>
                      <p className="font-semibold mt-1">{subject}</p>
                    </header>
                    <div
                      className="prose prose-sm max-w-none dark:prose-invert"
                      dangerouslySetInnerHTML={{ __html: convertToHtml(body) }}
                    />
                  </article>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default SendEmail;
