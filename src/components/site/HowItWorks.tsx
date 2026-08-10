import { Camera, MonitorPlay, Network, Users } from "lucide-react";
import { Reveal, SectionHeading } from "@/components/site/shared";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    icon: Camera,
    num: "01",
    title: "Your IP camera",
    text: "We obtain the video stream from your camera, DVR or NVR over RTSP. You just need a static IP address and port mapping on the router.",
  },
  {
    icon: MonitorPlay,
    num: "02",
    title: "Media server RTSP → WEB",
    text: "We prepare an HLS (M3U8) stream for websites and mobile devices — no plugins required. You get an HTML5 player for embedding.",
  },
  {
    icon: Network,
    num: "03",
    title: "RTSP proxy & scaling",
    text: "We receive a single stream from your device and duplicate it per viewer. That's how one camera can reach up to 1,000,000 simultaneous viewers.",
  },
];

export default function HowItWorks() {
  return (
    <section id="service" className="relative scroll-mt-24 py-20 sm:py-28">
      <div className="container">
        <SectionHeading
          eyebrow="Service"
          title={
            <>
              How we put your camera{" "}
              <span className="text-gradient">online</span>
            </>
          }
          description="A pipeline built for live video: ingest, transcode, scale. You plug in the camera — we handle the rest."
        />

        <div className="relative grid gap-6 md:grid-cols-3">
          {/* connector line */}
          <div className="pointer-events-none absolute left-1/2 top-16 hidden h-px w-[68%] -translate-x-1/2 bg-gradient-to-r from-transparent via-primary/40 to-transparent md:block" />

          {STEPS.map((s, i) => (
            <Reveal key={s.num} delay={i * 0.12}>
              <div className="card-hover group relative h-full rounded-xl border border-border bg-card p-7">
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex size-12 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
                    <s.icon className="size-6" />
                  </div>
                  <span className="font-mono text-4xl font-bold text-border transition-colors group-hover:text-primary/25">
                    {s.num}
                  </span>
                </div>
                <h3 className="mb-3 font-display text-xl font-semibold">{s.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.3} className="mt-10">
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-6 py-5 text-center sm:flex-row sm:gap-4">
            <Users className="size-5 text-primary" />
            <p className="text-sm text-foreground">
              <span className="font-semibold text-primary">One stream in — one million viewers out.</span>{" "}
              <span className="text-muted-foreground">
                Scale is handled by the proxy, automatically, per broadcast.
              </span>
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="mt-12">
          <div className={cn("grid gap-3 rounded-xl border border-border bg-card/50 p-6 text-sm text-muted-foreground sm:grid-cols-2 lg:grid-cols-4")}>
            {[
              "Supported browsers: Chrome, Firefox, Safari, Edge, Opera",
              "Codec pipeline: H.264 with HLS packaging",
              "Works on Windows, Linux, macOS, Android, iOS",
              "Audio from your camera supported for free",
            ].map((t) => (
              <div key={t} className="flex items-center gap-2.5">
                <span className="size-1.5 shrink-0 rounded-full bg-primary/70" />
                {t}
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
