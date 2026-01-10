import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../integrations/supabase/client";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { toast } from "sonner";
import { Loader2, Mail, Lock, ArrowLeft } from "lucide-react";
import { User, Session } from "@supabase/supabase-js";
import { SEO } from "../components/SEO";

export default function Settings() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [emailSettings, setEmailSettings] = useState({
    smtp_user: "",
    smtp_password: "",
    from_email: "",
    from_name: "",
  });
  const [emailProvider, setEmailProvider] = useState<'gmail' | 'outlook' | 'yahoo' | 'custom'>('gmail');

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

  useEffect(() => {
    if (user) {
      fetchEmailSettings();
    }
  }, [user]);

  // Auto-detect email provider when email changes
  const detectEmailProvider = (email: string) => {
    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain) return 'gmail';

    if (domain.includes('gmail') || domain.includes('googlemail')) return 'gmail';
    if (domain.includes('outlook') || domain.includes('hotmail') || domain.includes('live')) return 'outlook';
    if (domain.includes('yahoo')) return 'yahoo';
    return 'custom';
  };

  const fetchEmailSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("email_settings")
        .select("*")
        .eq("user_id", user?.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setEmailSettings({
          smtp_user: data.smtp_user,
          smtp_password: data.smtp_password,
          from_email: data.from_email,
          from_name: data.from_name || "",
        });
        setEmailProvider(data.provider as any);
      }
    } catch (error: any) {
      console.error("Error fetching email settings:", error);
      toast.error("Failed to load email settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation based on provider type
    if (emailProvider === 'custom') {
      if (!emailSettings.from_email) {
        toast.error("Please enter your email address");
        return;
      }
      toast.info("Custom domain setup requires DNS verification. Contact support for assistance.");
      return;
    }

    // For SMTP providers (Gmail, Outlook, Yahoo)
    if (!emailSettings.smtp_user || !emailSettings.smtp_password || !emailSettings.from_email) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSaving(true);
    try {
      // Get SMTP configuration based on provider
      // Using port 465 (SSL) for reliable TLS connection
      const smtpConfigs = {
        gmail: { host: 'smtp.gmail.com', port: 465 },
        outlook: { host: 'smtp.office365.com', port: 587 },
        yahoo: { host: 'smtp.mail.yahoo.com', port: 465 },
      };

      const smtpConfig = smtpConfigs[emailProvider as keyof typeof smtpConfigs] || smtpConfigs.gmail;

      const { error } = await supabase
        .from("email_settings")
        .upsert({
          user_id: user?.id,
          smtp_user: emailSettings.smtp_user,
          smtp_password: emailSettings.smtp_password,
          from_email: emailSettings.from_email,
          from_name: emailSettings.from_name || null,
          provider: emailProvider,
          smtp_host: smtpConfig.host,
          smtp_port: smtpConfig.port,
          domain_verified: false,
        }, { onConflict: 'user_id' });

      if (error) throw error;

      toast.success("Email settings saved successfully!");
    } catch (error: any) {
      console.error("Error saving email settings:", error);
      console.error("Error message:", error.message);
      console.error("Error details:", error.details);
      console.error("Error hint:", error.hint);
      console.error("Error code:", error.code);
      toast.error(error.message || "Failed to save email settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" role="status" aria-label="Loading settings">
        <Loader2 className="h-8 w-8 animate-spin" aria-hidden="true" />
        <span className="sr-only">Loading settings...</span>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Email Settings"
        description="Configure your email settings to send automated invoice reminders. Connect Gmail, Outlook, Yahoo, or custom SMTP for professional payment reminder emails."
        canonicalUrl="/settings"
        keywords="email settings, SMTP configuration, Gmail app password, invoice email setup, payment reminder settings"
        noIndex={true}
      />

      {/* Landing Page Background Elements */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background z-[-1]"></div>
      <div className="fixed w-[300px] h-[300px] bg-primary/20 rounded-full blur-[80px] opacity-30 top-[10%] left-[10%] animate-pulse z-[-1]"></div>
      <div className="fixed w-[400px] h-[400px] bg-primary/10 rounded-full blur-[80px] opacity-30 bottom-[10%] right-[10%] animate-pulse z-[-1]"></div>

      <div className="min-h-screen p-4">
        <main id="main-content" className="max-w-2xl mx-auto pt-8">
          <nav aria-label="Breadcrumb">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="mb-4 hover:bg-primary/10 hover:text-primary transition-colors"
              aria-label="Go back to dashboard"
            >
              <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
              Back to Dashboard
            </Button>
          </nav>

          <Card className="border-primary/20 bg-card/50 backdrop-blur-sm shadow-xl shadow-primary/5">
            <CardHeader>
              <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-primary">Email Settings</CardTitle>
              <CardDescription className="text-muted-foreground/80">
                Configure your Gmail account to send invoice reminders from your own email address.
                You&apos;ll need to create a Gmail App Password.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-6" aria-label="Email settings form">
                <div className="space-y-2">
                  <Label htmlFor="from_name">Your Name (optional)</Label>
                  <Input
                    id="from_name"
                    type="text"
                    placeholder="John Doe"
                    value={emailSettings.from_name}
                    onChange={(e) =>
                      setEmailSettings({ ...emailSettings, from_name: e.target.value })
                    }
                    autoComplete="name"
                    className="bg-background/50 border-primary/20 focus:border-primary focus:ring-primary/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="from_email">Your Email Address *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-primary" aria-hidden="true" />
                    <Input
                      id="from_email"
                      type="email"
                      placeholder="your.email@gmail.com"
                      value={emailSettings.from_email}
                      onChange={(e) => {
                        const email = e.target.value;
                        setEmailSettings({ ...emailSettings, from_email: email });
                        const detected = detectEmailProvider(email);
                        setEmailProvider(detected);
                      }}
                      className="pl-10 bg-background/50 border-primary/20 focus:border-primary focus:ring-primary/20"
                      required
                      autoComplete="email"
                      aria-required="true"
                    />
                  </div>
                </div>

                {emailProvider === 'custom' ? (
                  <aside className="space-y-4 rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-4" role="alert">
                    <div className="flex items-start gap-2">
                      <span className="text-2xl" aria-hidden="true">⚠️</span>
                      <div className="space-y-2">
                        <h2 className="text-sm font-semibold text-yellow-500">Custom Domain Detected</h2>
                        <p className="text-sm text-muted-foreground">
                          Custom domains require DNS verification through Resend. This is a professional
                          solution for agencies with their own domain.
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Most users should use Gmail, Outlook, or Yahoo instead for instant setup.
                        </p>
                        <div className="pt-2">
                          <p className="text-sm font-medium">Custom domain users get:</p>
                          <ul className="mt-1 space-y-1 text-sm text-muted-foreground">
                            <li>✓ Professional email appearance</li>
                            <li>✓ 3,000 emails/month free tier</li>
                            <li>✓ Better deliverability rates</li>
                            <li>⚠️ Requires DNS setup (24-48 hours)</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </aside>
                ) : (
                  <aside className="space-y-4 rounded-lg bg-primary/5 border border-primary/10 p-4" aria-label="Setup instructions">
                    <h2 className="text-sm font-medium text-primary">
                      📖 How to get {emailProvider === 'gmail' ? 'Gmail' : emailProvider === 'outlook' ? 'Outlook' : 'Yahoo'} App Password:
                    </h2>
                    {emailProvider === 'gmail' && (
                      <>
                        <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside marker:text-primary">
                          <li>Go to your Google Account Security settings</li>
                          <li>Enable 2-Step Verification if not already enabled</li>
                          <li>Search for &quot;App Passwords&quot; in the search bar</li>
                          <li>Create a new App Password for &quot;Mail&quot;</li>
                          <li>Copy the 16-character password and paste it below</li>
                        </ol>
                        <a
                          href="https://myaccount.google.com/apppasswords"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-sm text-primary hover:text-primary/80 transition-colors"
                        >
                          Get App Password →
                        </a>
                      </>
                    )}
                    {emailProvider === 'outlook' && (
                      <>
                        <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside marker:text-primary">
                          <li>Go to Microsoft Account Security settings</li>
                          <li>Enable Two-Step Verification</li>
                          <li>Go to Security → Advanced Security Options</li>
                          <li>Create a new App Password</li>
                          <li>Copy the password and paste it below</li>
                        </ol>
                        <a
                          href="https://account.microsoft.com/security"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-sm text-primary hover:text-primary/80 transition-colors"
                        >
                          Get App Password →
                        </a>
                      </>
                    )}
                    {emailProvider === 'yahoo' && (
                      <>
                        <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside marker:text-primary">
                          <li>Go to Yahoo Account Security settings</li>
                          <li>Enable Two-Step Verification</li>
                          <li>Generate an App Password for &quot;Mail&quot;</li>
                          <li>Copy the password and paste it below</li>
                        </ol>
                        <a
                          href="https://login.yahoo.com/account/security"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-sm text-primary hover:text-primary/80 transition-colors"
                        >
                          Get App Password →
                        </a>
                      </>
                    )}
                    <div className="mt-4 rounded-md bg-green-500/10 border border-green-500/20 p-3">
                      <p className="text-sm font-medium text-green-500">
                        ✓ Free forever • 500 emails/day • Setup in 2 minutes
                      </p>
                    </div>
                  </aside>
                )}

                {emailProvider !== 'custom' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="smtp_user">
                        {emailProvider === 'gmail' ? 'Gmail' : emailProvider === 'outlook' ? 'Outlook' : 'Yahoo'} Email Address *
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-primary" aria-hidden="true" />
                        <Input
                          id="smtp_user"
                          type="email"
                          placeholder={`your.email@${emailProvider === 'gmail' ? 'gmail.com' : emailProvider === 'outlook' ? 'outlook.com' : 'yahoo.com'}`}
                          value={emailSettings.smtp_user}
                          onChange={(e) =>
                            setEmailSettings({ ...emailSettings, smtp_user: e.target.value })
                          }
                          className="pl-10 bg-background/50 border-primary/20 focus:border-primary focus:ring-primary/20"
                          required
                          autoComplete="email"
                          aria-required="true"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="smtp_password">App Password *</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-primary" aria-hidden="true" />
                        <Input
                          id="smtp_password"
                          type="password"
                          placeholder="16-character app password"
                          value={emailSettings.smtp_password}
                          onChange={(e) =>
                            setEmailSettings({ ...emailSettings, smtp_password: e.target.value })
                          }
                          className="pl-10 bg-background/50 border-primary/20 focus:border-primary focus:ring-primary/20"
                          required
                          autoComplete="current-password"
                          aria-required="true"
                          aria-describedby="password-hint"
                        />
                      </div>
                      <p id="password-hint" className="text-xs text-muted-foreground">
                        Use your App Password, not your regular email password
                      </p>
                    </div>
                  </>
                )}

                <Button type="submit" disabled={saving || emailProvider === 'custom'} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 font-semibold">
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
                  {emailProvider === 'custom' ? 'Contact Support for Custom Domain' : 'Save Email Settings'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  );
}
