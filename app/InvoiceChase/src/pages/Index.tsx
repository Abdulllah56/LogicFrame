import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { InvoiceForm } from "../components/InvoiceForm";
import { InvoiceTable } from "../components/InvoiceTable";
import { StatsCards } from "../components/StatsCards";
import { supabase } from "../integrations/supabase/client";
import { Button } from "../components/ui/button";
import { PlusCircle, X, LogOut, Settings, Mail } from "lucide-react";
import { ThemeToggle } from "../components/ThemeToggle";
import { User, Session } from "@supabase/supabase-js";
import { toast } from "sonner";
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
  reminders_sent: number;
  created_at: string;
}

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (!session) {
        navigate("/auth");
      }
    });

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchInvoices = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .eq("user_id", user.id)
        .order("due_date", { ascending: true });

      if (error) throw error;

      // Sort: overdue unpaid first, then by due date
      const sorted = (data || []).sort((a, b) => {
        const aOverdue = new Date(a.due_date) < new Date() && a.status === "unpaid";
        const bOverdue = new Date(b.due_date) < new Date() && b.status === "unpaid";

        if (aOverdue && !bOverdue) return -1;
        if (!aOverdue && bOverdue) return 1;

        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      });

      setInvoices(sorted);
    } catch (error) {
      console.error("Error fetching invoices:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchInvoices();

      // Subscribe to realtime changes
      const channel = supabase
        .channel('invoices-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'invoices',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            fetchInvoices();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const calculateStats = () => {
    // Include both 'unpaid' and 'pending' statuses in total unpaid amount
    const totalUnpaid = invoices
      .filter((inv) => ["unpaid", "pending"].includes(inv.status))
      .reduce((sum, inv) => sum + Number(inv.amount), 0);

    const overdueCount = invoices.filter((inv) => {
      if (inv.status === "paid") return false;
      return new Date(inv.due_date) < new Date();
    }).length;

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const paidThisMonth = invoices
      .filter((inv) => {
        if (inv.status !== "paid") return false;
        const createdDate = new Date(inv.created_at);
        return (
          createdDate.getMonth() === currentMonth &&
          createdDate.getFullYear() === currentYear
        );
      })
      .reduce((sum, inv) => sum + Number(inv.amount), 0);

    return { totalUnpaid, overdueCount, paidThisMonth };
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Failed to logout");
    } else {
      toast.success("Logged out successfully");
      navigate("/auth");
    }
  };

  const stats = calculateStats();

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
        title="Dashboard"
        description="Manage your invoices, track payments, and send automated reminders. View your payment statistics and overdue invoices in one place."
        canonicalUrl="/"
        keywords="invoice dashboard, payment tracking, invoice management, accounts receivable dashboard, payment reminders"
      />

      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background z-[-1]"></div>
      <div className="fixed w-[300px] h-[300px] bg-primary/20 rounded-full blur-[80px] opacity-30 top-[10%] left-[10%] animate-pulse z-[-1]"></div>
      <div className="fixed w-[400px] h-[400px] bg-primary/10 rounded-full blur-[80px] opacity-30 bottom-[10%] right-[10%] animate-pulse z-[-1]"></div>

      <div className="min-h-screen relative">
        <main id="main-content" className="container mx-auto py-8 px-4 max-w-7xl">
          {/* Header */}
          <header className="mb-8" role="banner">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-primary">Payment Chase</h1>
                <p className="text-muted-foreground mt-1">
                  Automated invoice reminders for hassle-free payments
                </p>
              </div>
              <nav className="flex items-center gap-3" role="navigation" aria-label="Main navigation">
                <ThemeToggle />
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate("/send-email")}
                  aria-label="Send email reminder"
                >
                  <Mail className="mr-2 h-5 w-5" aria-hidden="true" />
                  Send Email
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate("/settings")}
                  aria-label="Go to settings"
                >
                  <Settings className="mr-2 h-5 w-5" aria-hidden="true" />
                  Settings
                </Button>
                <Button
                  onClick={() => setShowForm(!showForm)}
                  size="lg"
                  aria-expanded={showForm}
                  aria-controls="invoice-form"
                >
                  {showForm ? (
                    <>
                      <X className="mr-2 h-5 w-5" aria-hidden="true" />
                      Close
                    </>
                  ) : (
                    <>
                      <PlusCircle className="mr-2 h-5 w-5" aria-hidden="true" />
                      New Invoice
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={handleLogout}
                  aria-label="Logout"
                >
                  <LogOut className="mr-2 h-5 w-5" aria-hidden="true" />
                  Logout
                </Button>
              </nav>
            </div>
          </header>

          {/* Form */}
          {showForm && (
            <section id="invoice-form" className="mb-8" aria-label="Create new invoice">
              <InvoiceForm
                onInvoiceCreated={() => {
                  fetchInvoices();
                  setShowForm(false);
                }}
              />
            </section>
          )}

          {/* Stats */}
          <section className="mb-8" aria-label="Payment statistics">
            <StatsCards
              totalUnpaid={stats.totalUnpaid}
              overdueCount={stats.overdueCount}
              paidThisMonth={stats.paidThisMonth}
            />
          </section>

          {/* Table */}
          <section aria-label="Invoice list">
            <InvoiceTable invoices={invoices} onUpdate={fetchInvoices} />
          </section>
        </main>
      </div>
    </>
  );
};

export default Index;
