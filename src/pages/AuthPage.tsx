import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useAuthActions, useConvexAuth } from "@convex-dev/auth/react";
import { AlertCircle, Loader2, Radio, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AuthPage() {
  const { signIn } = useAuthActions();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/dashboard";

  const [tab, setTab] = useState<"signIn" | "signUp">(
    searchParams.get("mode") === "signup" ? "signUp" : "signIn",
  );
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={returnTo} replace />;
  }

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const email = String(data.get("email") ?? "");
    const password = String(data.get("password") ?? "");
    const name = String(data.get("name") ?? "");

    setBusy(true);
    setError(null);
    try {
      await signIn("password", {
        email,
        password,
        flow: tab,
        ...(tab === "signUp" ? { name } : {}),
      });
      navigate(returnTo, { replace: true });
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

                <Button type="submit" className="w-full" size="lg" disabled={busy}>
                  {busy && <Loader2 className="animate-spin" />}
                  {tab === "signIn" ? "Sign in" : "Create account"}
                </Button>
              </form>
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
