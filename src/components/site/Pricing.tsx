import { useNavigate } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal, SectionHeading } from "@/components/site/shared";
import { cn } from "@/lib/utils";

const TIERS = [
  {
    range: "100 – 10,000",
    price: "5",
    note: "views per month",
    popular: false,
    perks: ["1 camera", "Cloud archive option", "Copy protection PHP", "Email support"],
  },
  {
    range: "10,000 – 100,000",
    price: "20",
    note: "views per month",
    popular: true,
    perks: ["1 camera", "Cloud archive option", "Copy protection PHP", "Priority support"],
  },
  {
    range: "100,000 – 1,000,000",
    price: "100",
    note: "views per month",
    popular: false,
    perks: ["1 camera", "Cloud archive option", "Copy protection PHP", "Dedicated manager"],
  },
];

const CONDITIONS = [
  "Price is a monthly subscription for each camera.",
  "Post-payment: views are calculated on the last day of the month and we send an invoice by email.",
  "If payment is not made within 20 days, the broadcast is blocked.",
  "A view is counted when our HTML live player is launched. Views are not counted only when the broadcast is off.",
  "Payment by bank card or company invoice.",
];

export default function Pricing() {
  const navigate = useNavigate();

  return (
    <section id="pricing" className="relative scroll-mt-24 py-20 sm:py-28">
      <div className="pointer-events-none absolute left-0 top-1/4 h-[380px] w-[380px] rounded-full bg-primary/8 blur-[130px]" />
      <div className="container relative">
        <SectionHeading
          eyebrow="Tariffs"
          title={
            <>
              Simple, view-based{" "}
              <span className="text-gradient">pricing</span>
            </>
          }
          description="You only pay for what your stream actually delivers. Post-payment means no commitments — start streaming today."
        />

        <div className="grid gap-6 md:grid-cols-3">
          {TIERS.map((t, i) => (
            <Reveal key={t.price} delay={i * 0.1}>
              <div
                className={cn(
                  "card-hover relative flex h-full flex-col rounded-xl border bg-card p-7",
                  t.popular
                    ? "border-primary/60 shadow-[0_0_50px_-16px_hsl(187_95%_55%/0.45)]"
                    : "border-border",
                )}
              >
                {t.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border border-primary/50 bg-primary px-3 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-widest text-primary-foreground">
                    Most popular
                  </span>
                )}
                <div className="mb-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  {t.range} views / month
                </div>
                <div className="mb-6 flex items-baseline gap-1.5">
                  <span className="font-display text-5xl font-bold text-foreground">
                    €{t.price}
                  </span>
                  <span className="text-sm text-muted-foreground">/ month</span>
                </div>
                <p className="mb-6 text-sm text-muted-foreground">
                  {t.note} per camera, billed after the month ends.
                </p>
                <ul className="mb-8 space-y-2.5">
                  {t.perks.map((p) => (
                    <li key={p} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                      <Check className="size-4 shrink-0 text-primary" />
                      {p}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto">
                  <Button
                    className="w-full"
                    variant={t.popular ? "default" : "outline"}
                    onClick={() => navigate("/auth?returnTo=%2Fdashboard")}
                  >
                    Start streaming
                    <ArrowRight />
                  </Button>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.25} className="mt-10">
          <div className="rounded-xl border border-border bg-card/60 p-7">
            <h3 className="mb-4 font-display text-lg font-semibold">Conditions</h3>
            <ul className="grid gap-3 text-sm text-muted-foreground lg:grid-cols-2">
              {CONDITIONS.map((c) => (
                <li key={c} className="flex items-start gap-2.5">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary/70" />
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
