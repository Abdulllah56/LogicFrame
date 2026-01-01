import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../integrations/supabase/client";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { toast } from "sonner";
import { Loader2, Mail, Lock, User } from "lucide-react";
import { SEO } from "../components/SEO";

export default function Auth() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              full_name: fullName,
            }
          }
        });

        if (error) throw error;

        if (data.user) {
          // Create profile
          const { error: profileError } = await supabase
            .from("profiles")
            .insert({
              id: data.user.id,
              email: data.user.email!,
              full_name: fullName,
            });

          if (profileError) {
            console.error("Profile creation error:", profileError);
          }

          toast.success("Account created successfully!");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        toast.success("Logged in successfully!");
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      console.error("Auth error message:", error.message);
      console.error("Auth error cause:", error.cause);
      toast.error(error.message || "Authentication failed. Please check your credentials.");

      // Additional debugging note for developer
      if (error.message === "Invalid login credentials") {
        console.warn("Possible causes: Wrong password, user not found, or email not confirmed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO
        title={isSignUp ? "Create Account" : "Sign In"}
        description={isSignUp
          ? "Create your free PayChaser account. Start automating invoice reminders and get paid faster today."
          : "Sign in to PayChaser to manage your invoices and payment reminders. Access your dashboard and track payments."
        }
        canonicalUrl="/auth"
        keywords="login, sign in, create account, register, invoice management login, payment tracker sign up"
        noIndex={true}
      />

      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background z-[-1]"></div>
      <div className="fixed w-[300px] h-[300px] bg-primary/20 rounded-full blur-[80px] opacity-30 top-[10%] left-[10%] animate-pulse z-[-1]"></div>
      <div className="fixed w-[400px] h-[400px] bg-primary/10 rounded-full blur-[80px] opacity-30 bottom-[10%] right-[10%] animate-pulse z-[-1]"></div>

      <div className="min-h-screen flex items-center justify-center p-4">
        <main id="main-content" className="w-full max-w-md">
          <Card className="w-full border-primary/20 bg-card/50 backdrop-blur-sm shadow-xl shadow-primary/5">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-white to-primary">
                {isSignUp ? "Create an account" : "Welcome back"}
              </CardTitle>
              <CardDescription className="text-center text-muted-foreground/80">
                {isSignUp
                  ? "Enter your details to create your account"
                  : "Enter your credentials to access your account"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAuth} className="space-y-4" aria-label={isSignUp ? "Sign up form" : "Sign in form"}>
                {isSignUp && (
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-primary" aria-hidden="true" />
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="John Doe"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="pl-10 bg-background/50 border-primary/20 focus:border-primary focus:ring-primary/20"
                        autoComplete="name"
                        aria-describedby="fullName-description"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-primary" aria-hidden="true" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-background/50 border-primary/20 focus:border-primary focus:ring-primary/20"
                      required
                      autoComplete="email"
                      aria-required="true"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-primary" aria-hidden="true" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 bg-background/50 border-primary/20 focus:border-primary focus:ring-primary/20"
                      required
                      minLength={6}
                      autoComplete={isSignUp ? "new-password" : "current-password"}
                      aria-required="true"
                      aria-describedby="password-requirements"
                    />
                  </div>
                  {isSignUp && (
                    <p id="password-requirements" className="text-xs text-muted-foreground">
                      Password must be at least 6 characters
                    </p>
                  )}
                </div>

                <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 font-semibold" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                      <span>{isSignUp ? "Creating account..." : "Signing in..."}</span>
                    </>
                  ) : (
                    <span>{isSignUp ? "Create account" : "Sign in"}</span>
                  )}
                </Button>
              </form>

              <div className="mt-4 text-center text-sm">
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-primary hover:text-primary/80 transition-colors hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                  aria-label={isSignUp ? "Switch to sign in" : "Switch to sign up"}
                >
                  {isSignUp
                    ? "Already have an account? Sign in"
                    : "Don't have an account? Sign up"}
                </button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  );
}
