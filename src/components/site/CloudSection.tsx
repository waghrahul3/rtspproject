import { useState } from "react";
import {
  CalendarClock,
  Cloud,
  Database,
  Globe2,
  HardDrive,
  Lock,
  PlayCircle,
} from "lucide-react";
import { Reveal, SectionHeading } from "@/components/site/shared";
import { cn } from "@/lib/utils";

const REGIONS = [
  { name: "North America", ping: "18 ms", x: "26%", y: "38%" },
  { name: "South America", ping: "42 ms", x: "34%", y: "72%" },
  { name: "Europe", ping: "12 ms", x: "56%", y: "34%" },
  { name: "Asia", ping: "28 ms", x: "74%", y: "44%" },
  { name: "Australia", ping: "36 ms", x: "84%", y: "78%" },
];

const RECORD_MODES = ["24/7", "Motion", "Schedule"];
const STORAGE = ["7 days", "30 days", "90 days", "360 days"];

const BULLETS = [
  {
    icon: Database,
    title: "Cloud video surveillance",
    text: "Record your streams to the cloud and estimate the cost in seconds.",
  },
  {
    icon: HardDrive,
    title: "Archive up to 360 days",
    text: "Storage in reliable data centers, browsable timeline playback.",
  },
  {
    icon: Lock,
    title: "Private by design",
    text: "Real RTSP addresses and camera credentials stay hidden from viewers.",
  },
];

export default function CloudSection() {
  const [mode, setMode] = useState("24/7");
  const [days, setDays] = useState("30 days");

  return (
    <section id="cloud" className="relative scroll-mt-24 py-20 sm:py-28">
      <div className="pointer-events-none absolute right-0 top-1/3 h-[360px] w-[360px] rounded-full bg-primary/8 blur-[120px]" />
      <div className="container relative">
        <SectionHeading
          eyebrow="Cloud"
          title={
            <>
              Cloud video <span className="text-gradient">surveillance</span>
            </>
          }
          description="Record your streams, keep a searchable archive, and watch back any moment — without hosting a single server yourself."
        />

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          {/* calculator mock */}
          <Reveal>
            <div className="card-hover rounded-xl border border-border bg-card p-7 sm:p-8">
              <div className="mb-7 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-lg border border-primary/30 bg-primary/10">
                    <Cloud className="size-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-semibold">Cloud Archive</h3>
                    <p className="text-xs text-muted-foreground">Estimate cost in seconds</p>
                  </div>
                </div>
                <span className="font-mono text-xs text-emerald-400">● recording</span>
              </div>

              <div className="mb-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Recording mode
              </div>
              <div className="mb-6 flex gap-2">
                {RECORD_MODES.map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={cn(
                      "flex-1 rounded-lg border px-3 py-2 text-sm transition-all",
                      mode === m
                        ? "border-primary/60 bg-primary/15 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground",
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>

              <div className="mb-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Storage period
              </div>
              <div className="mb-8 flex flex-wrap gap-2">
                {STORAGE.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDays(d)}
                    className={cn(
                      "rounded-full border px-4 py-1.5 text-sm transition-all",
                      days === d
                        ? "border-primary/60 bg-primary/15 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground",
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>

              {/* playback timeline mock */}
              <div className="rounded-lg border border-border bg-[#070b12] p-4">
                <div className="mb-3 flex items-center gap-3">
                  <PlayCircle className="size-5 text-primary" />
                  <span className="font-mono text-xs text-muted-foreground">
                    playback_2026-08-10_14-00.m3u8
                  </span>
                  <span className="ml-auto font-mono text-[10px] text-primary">4K ✓</span>
                </div>
                <div className="relative h-10 rounded-md border border-border/70 bg-gradient-to-r from-primary/25 via-primary/10 to-primary/5">
                  <div className="absolute left-[18%] top-0 h-full w-px bg-primary/60" />
                  <div className="absolute left-[18%] top-0 flex h-full items-center">
                    <span className="-ml-px size-3 rounded-full border-2 border-primary bg-background shadow-[0_0_10px_2px_hsl(187_95%_55%/0.5)]" />
                  </div>
                  <div className="absolute bottom-1 left-[18%] font-mono text-[9px] text-primary">14:00</div>
                  <div className="absolute bottom-1 right-2 font-mono text-[9px] text-muted-foreground">now</div>
                </div>
                <div className="mt-2 flex justify-between font-mono text-[10px] text-muted-foreground">
                  <span>{mode} recording · {days} retention</span>
                  <span>~0.9 GB / day</span>
                </div>
              </div>
            </div>
          </Reveal>

          {/* bullets + data centers */}
          <div className="flex flex-col gap-6">
            {BULLETS.map((b, i) => (
              <Reveal key={b.title} delay={i * 0.1}>
                <div className="card-hover flex gap-4 rounded-xl border border-border bg-card p-6">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-primary/10 text-primary">
                    <b.icon className="size-5" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-display font-semibold">{b.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{b.text}</p>
                  </div>
                </div>
              </Reveal>
            ))}

            <Reveal delay={0.3}>
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="mb-5 flex items-center gap-2.5">
                  <Globe2 className="size-5 text-primary" />
                  <h3 className="font-display font-semibold">Our data centers</h3>
                </div>
                <div className="relative mb-6 h-40 overflow-hidden rounded-lg border border-border/60 bg-[#070b12]">
                  <div className="absolute inset-0 bg-grid opacity-50" />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "radial-gradient(circle at 50% 50%, hsl(187 95% 55% / 0.08), transparent 60%)",
                    }}
                  />
                  {/* stylized dotted map */}
                  <svg className="absolute inset-0 h-full w-full" viewBox="0 0 200 80" preserveAspectRatio="none">
                    {REGIONS.map((r) => (
                      <circle
                        key={r.name}
                        cx={Number(r.x.replace("%", "")) * 2}
                        cy={Number(r.y.replace("%", "")) * 1}
                        r="1.4"
                        fill="hsl(187 95% 55% / 0.45)"
                      />
                    ))}
                  </svg>
                  {REGIONS.map((r) => (
                    <span
                      key={r.name}
                      className="absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary"
                      style={{ left: r.x, top: r.y }}
                    >
                      <span className="absolute -inset-1 animate-pulse-ring rounded-full border border-primary/50" />
                    </span>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                  {REGIONS.map((r) => (
                    <div
                      key={r.name}
                      className="rounded-md border border-border/70 bg-background/60 px-2 py-2 text-center"
                    >
                      <div className="text-xs font-medium text-foreground">{r.name}</div>
                      <div className="font-mono text-[10px] text-primary">{r.ping}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
