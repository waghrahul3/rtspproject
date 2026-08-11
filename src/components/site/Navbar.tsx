import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const LINKS = [
  { href: "#service", label: "Service" },
  { href: "#cloud", label: "Cloud" },
  { href: "#pricing", label: "Pricing" },
  { href: "#api", label: "API" },
  { href: "#faq", label: "FAQ" },
  { href: "#products", label: "Products" },
];

function Brand() {
  return (
    <Link to="/" className="group flex items-center gap-2.5">
      <span className="relative flex size-8 items-center justify-center rounded-lg border border-primary/40 bg-primary/10">
        <span className="size-2.5 rounded-full bg-primary shadow-[0_0_10px_2px_hsl(187_95%_55%/0.6)] transition-transform group-hover:scale-125" />
        <span className="absolute -right-0.5 -top-0.5 size-1.5 animate-blink rounded-full bg-red-500" />
      </span>
      <span className="font-display text-lg font-bold tracking-tight text-foreground">
        rtsp<span className="text-primary">.me</span>
      </span>
    </Link>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { user, loading } = useAuth();
  const isAuthenticated = Boolean(user);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled ? "glass border-b border-border/70 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.7)]" : "bg-transparent",
      )}
    >
      <nav className="container flex h-16 items-center justify-between gap-4">
        <Brand />

        <div className="hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          {loading ? null : isAuthenticated ? (
            <Button size="sm" onClick={() => navigate("/dashboard")}>
              My broadcasts
            </Button>
          ) : (
            <>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => navigate("/auth?returnTo=%2Fdashboard")}
              >
                Sign in
              </Button>
              <Button size="sm" onClick={() => navigate("/auth?returnTo=%2Fdashboard")}>
                Start streaming
              </Button>
            </>
          )}
        </div>

        <button
          className="rounded-md border border-border p-2 text-muted-foreground hover:text-foreground lg:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      {open && (
        <div className="glass border-t border-border/70 lg:hidden">
          <div className="container flex flex-col gap-1 py-4">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                {l.label}
              </a>
            ))}
            <div className="mt-3 flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => navigate("/auth?returnTo=%2Fdashboard")}
              >
                {isAuthenticated ? "Dashboard" : "Sign in"}
              </Button>
              <Button
                className="flex-1"
                onClick={() => navigate("/auth?returnTo=%2Fdashboard")}
              >
                Start streaming
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
