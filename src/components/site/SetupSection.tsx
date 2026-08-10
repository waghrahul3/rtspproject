import { Check, HelpCircle, Info } from "lucide-react";
import { Reveal, SectionHeading } from "@/components/site/shared";

const REQUIREMENTS = [
  {
    title: "IP camera, DVR, NVR or XVR",
    text: "Any device that speaks RTSP and encodes H.264.",
  },
  {
    title: "Unlimited internet",
    text: "Upload bandwidth for an always-on live stream.",
  },
  {
    title: "Static IP address",
    text: "A permanent address so viewers can always reach you.",
  },
  {
    title: "Access to modem settings",
    text: "To configure port mapping for RTSP port 554.",
  },
];

const SETUP_STEPS = [
  {
    num: "1",
    title: "Find your static IP address",
    text: "Ask your ISP or check your router's WAN page.",
    hint: "e.g. 78.78.78.78",
  },
  {
    num: "2",
    title: "Find the RTSP link of your camera",
    text: "Usually rtsp://user:pass@IP:554/… — templates in the FAQ.",
    hint: "rtsp://admin:••••@78.78.78.78:554/…",
  },
  {
    num: "3",
    title: "Configure port mapping",
    text: "Forward port 554 (TCP/UDP) from your router to the camera.",
    hint: "WAN 78.78.78.78:554 → 192.168.1.100:554",
  },
  {
    num: "4",
    title: "Create the broadcast",
    text: "Paste the RTSP link, publish, and copy your player code.",
    hint: "rtsp.me/embed/474NtQT5/",
  },
];

export default function SetupSection() {
  return (
    <section className="relative py-20 sm:py-28">
      <div className="container">
        <SectionHeading
          eyebrow="Requirements"
          title={
            <>
              What you need to go{" "}
              <span className="text-gradient">live</span>
            </>
          }
          description="The requirements are simple — and if any of it sounds intimidating, order one of our cameras and we'll set everything up for you."
        />

        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          {/* requirements */}
          <Reveal>
            <div className="h-full rounded-xl border border-border bg-card p-7">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg border border-primary/25 bg-primary/10">
                  <HelpCircle className="size-5 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold">What you need</h3>
              </div>
              <ul className="space-y-4">
                {REQUIREMENTS.map((r) => (
                  <li key={r.title} className="flex items-start gap-3">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-500/10">
                      <Check className="size-3 text-emerald-400" />
                    </span>
                    <div>
                      <div className="text-sm font-medium text-foreground">{r.title}</div>
                      <div className="text-sm text-muted-foreground">{r.text}</div>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-6 rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
                Don't want to deal with networking? Order our{" "}
                <span className="font-medium text-primary">MyVMS 5Mp Bullet</span>{" "}
                camera or{" "}
                <span className="font-medium text-primary">MyVMS Bridge</span> —
                just connect it to the internet and our support handles the rest.
              </div>
            </div>
          </Reveal>

          {/* setup steps */}
          <Reveal delay={0.12}>
            <div className="h-full rounded-xl border border-border bg-card p-7">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg border border-primary/25 bg-primary/10">
                  <Info className="size-5 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold">How to set up</h3>
              </div>
              <ol className="space-y-5">
                {SETUP_STEPS.map((s) => (
                  <li key={s.num} className="flex gap-4">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-primary/40 bg-primary/10 font-mono text-sm font-bold text-primary">
                      {s.num}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-foreground">{s.title}</div>
                      <div className="text-sm text-muted-foreground">{s.text}</div>
                      <div className="mt-1.5 truncate rounded-md border border-border/70 bg-[#070b12] px-2.5 py-1 font-mono text-xs text-cyan-200/80">
                        {s.hint}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
              <div className="mt-6 flex items-start gap-2.5 rounded-lg border border-amber-500/25 bg-amber-500/8 p-4 text-sm text-amber-200/90">
                <Info className="mt-0.5 size-4 shrink-0 text-amber-400" />
                <span>
                  <span className="font-semibold">Camera tip:</span> set GOP to
                  less than 2 seconds for the lowest stream startup latency.
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
