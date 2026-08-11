import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { AlertCircle, AlertTriangle, Loader2, Radio, Rocket, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth-context";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { DEMO_EMAIL, DEMO_PASSWORD } from "@/lib/demo";

export default function AuthPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/dashboard";

  const [tab, setTab] = useState<"signIn" | "signUp">(
    searchParams.get("mode") === "signup" ? "signUp" : "signIn",
  );
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    return <Navigate to={returnTo} replace />;
  }

  const tryDemo = async () => {
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
      });
      if (signInError) throw signInError;
      navigate(returnTo, { replace: true });
    } catch {
      // Account doesn't exist yet — create it on first use.
      try {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: DEMO_EMAIL,
          password: DEMO_PASSWORD,
          options: { data: { name: "Demo User" } },
        });
        if (signUpError) throw signUpError;
        if (!data.session) {
          // Email confirmation is enabled — the migration should have
          // pre-created the demo user, so this is the rare fallback path.
          setInfo(
            "Demo account created — confirm your email to finish, or run the Supabase migration which pre-creates it.",
          );
        } else {
          navigate(returnTo, { replace: true });
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Couldn't start the demo. Sign up manually instead.",
        );
      }
    } finally {
      setBusy(false);
    }
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");
    const name = String(data.get("name") ?? "").trim();

    // Typing the demo credentials manually should behave like "Try demo":
    // auto-create the account on first use instead of failing.
    if (tab === "signIn" && email === DEMO_EMAIL && password === DEMO_PASSWORD) {
      await tryDemo();
      return;
    }

    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      if (tab === "signIn") {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        navigate(returnTo, { replace: true });
      } else {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name } },
        });
        if (signUpError) throw signUpError;
        if (!signUpData.session) {
          // "Confirm email" is enabled in the Supabase dashboard by default.
          setInfo(
            "Account created — check your inbox and confirm your email, then sign in. (Tip: turn off “Confirm email” in Supabase Auth → Providers → Email for instant sign-ups.)",
          );
        } else {
          navigate(returnTo, { replace: true });
        }
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : tab === "signUp"
            ? "Couldn't create the account. Try a different email or stronger password."
            : "Invalid email or password.";
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12">
      <div className="pointer-events-none absolute inset-0 bg-grid bg-grid-fade opacity-60" />
      <div className="pointer-events-none absolute -top-24 left-1/2 h-[380px] w-[640px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />

      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <span className="relative flex size-10 items-center justify-center rounded-xl border border-primary/40 bg-primary/10">
              <span className="size-3 rounded-full bg-primary shadow-[0_0_12px_3px_hsl(187_95%_55%/0.6)]" />
              <span className="absolute -right-0.5 -top-0.5 size-1.5 animate-blink rounded-full bg-red-500" />
            </span>
            <span className="font-display text-xl font-bold">
              rtsp<span className="text-primary">.me</span>
            </span>
          </Link>
          <h1 className="mt-5 font-display text-2xl font-bold tracking-tight">
            {tab === "signIn" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {tab === "signIn"
              ? "Sign in to manage your broadcasts and viewers."
              : "Start streaming your cameras in under a minute."}
          </p>
        </div>

        {!isSupabaseConfigured && (
          <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <span>
              Supabase isn't configured yet. Add{" "}
              <code className="font-mono">VITE_SUPABASE_URL</code> and{" "}
              <code className="font-mono">VITE_SUPABASE_ANON_KEY</code> in the API Keys panel to
              enable login.
            </span>
          </div>
        )}

        <div className="rounded-2xl border border-border bg-card p-6 shadow-2xl sm:p-8">
          <Tabs value={tab} onValueChange={(v) => setTab(v as "signIn" | "signUp")}>
            <TabsList className="mb-6 grid w-full grid-cols-2">
              <TabsTrigger value="signIn">Sign in</TabsTrigger>
              <TabsTrigger value="signUp">Sign up</TabsTrigger>
            </TabsList>

            <TabsContent value={tab} className="mt-0">
              <form onSubmit={onSubmit} className="space-y-5">
                {tab === "signUp" && (
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" name="name" placeholder="Jane Doe" autoComplete="name" />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    autoComplete={tab === "signIn" ? "current-password" : "new-password"}
                    required
                  />
                </div>

                {error && (
                  <div className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 px-3.5 py-3 text-sm text-destructive">
                    <AlertCircle className="mt-0.5 size-4 shrink-0" />
                    {error}
                  </div>
                )}
                {info && (
                  <div className="flex items-start gap-2.5 rounded-lg border border-primary/30 bg-primary/10 px-3.5 py-3 text-sm text-primary">
                    <AlertCircle className="mt-0.5 size-4 shrink-0" />
                    {info}
                  </div>
                )}

                <Button type="submit" className="w-full" size="lg" disabled={busy || !isSupabaseConfigured}>
                  {busy && <Loader2 className="animate-spin" />}
                  {tab === "signIn" ? "Sign in" : "Create account"}
                </Button>
              </form>

              <div className="mt-5 flex items-center gap-3">
                <span className="h-px flex-1 bg-border/60" />
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  or
                </span>
                <span className="h-px flex-1 bg-border/60" />
              </div>

              <div className="mt-5 rounded-xl border border-primary/20 bg-primary/5 p-4">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-foreground">
                    Explore the demo
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    onClick={tryDemo}
                    disabled={busy || !isSupabaseConfigured}
                    className="h-8 px-3 text-xs"
                  >
                    {busy ? <Loader2 className="animate-spin" /> : <Rocket />}
                    Try demo
                  </Button>
                </div>
                <p className="font-mono text-[11px] text-muted-foreground">
                  {DEMO_EMAIL} · {DEMO_PASSWORD}
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="mt-6 grid gap-2.5 rounded-xl border border-border bg-card/60 p-4 sm:grid-cols-3">
          {[
            { icon: Zap, text: "Set up in minutes" },
            { icon: Radio, text: "HLS + embed player" },
            { icon: ShieldCheck, text: "Your links stay private" },
          ].map((f) => (
            <div key={f.text} className="flex items-center gap-2 text-xs text-muted-foreground">
              <f.icon className="size-3.5 shrink-0 text-primary" />
              {f.text}
            </div>
          ))}
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link to="/" className="text-primary hover:underline">
            ← Back to homepage
          </Link>
        </p>
      </div>
    </div>
  );
}
