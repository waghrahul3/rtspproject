import { useEffect, useRef } from "react";
import { motion, useInView, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, FileCode2, Globe, PlayCircle, Signal, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import CameraFeed from "@/components/site/CameraFeed";
import { cn } from "@/lib/utils";

const PROTOCOLS = [
  "RTSP", "RTMP", "HLS (M3U8)", "M-JPEG", "JPEG", "H.264", "H.265",
  "WebRTC", "ONVIF", "IP / AHD / TVI / CVI",
];

function Counter({
  value,
  suffix = "",
  className,
}: {
  value: number;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { duration: 2200, bounce: 0 });
  const rounded = useTransform(spring, (v) => Math.floor(v).toLocaleString("en-US"));

  useEffect(() => {
    if (inView) mv.set(value);
  }, [inView, value, mv]);

  return (
    <span ref={ref} className={className}>
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  );
}

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden pb-20 pt-32 sm:pb-28 sm:pt-40">
      {/* backdrop */}
      <div className="pointer-events-none absolute inset-0 bg-grid bg-grid-fade opacity-70" />
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[480px] w-[820px] -translate-x-1/2 rounded-full bg-primary/10 blur-[130px]" />

      <div className="container relative grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
        {/* copy */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 text-xs font-medium text-primary"
          >
            <Signal className="size-3.5" />
            RTSP → HLS streaming in one click
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.08 }}
            className="font-display text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl md:text-6xl"
          >
            Put your IP camera on the web{" "}
            <span className="text-gradient">in one click</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.16 }}
            className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            Create an online RTSP broadcast from any IP camera, DVR or NVR.
            We prepare the HLS stream, handle the scaling, and give you a
            copy-paste HTML5 player for your website — no plugins, no code.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.24 }}
            className="mt-8 flex flex-wrap items-center gap-4"
          >
            <Button
              size="lg"
              onClick={() => navigate("/auth?returnTo=%2Fdashboard")}
              className="group"
            >
              Create free broadcast
              <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/auth?returnTo=%2Fdashboard")}>
              <PlayCircle />
              See how it works
            </Button>
          </motion.div>

          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.34 }}
            className="mt-10 grid max-w-xl grid-cols-1 gap-3 text-sm text-muted-foreground sm:grid-cols-3"
          >
            {[
              { icon: Zap, text: "Up to 1M simultaneous viewers" },
              { icon: FileCode2, text: "Copy-paste embed player" },
              { icon: Globe, text: "5 global data center regions" },
            ].map((f) => (
              <li key={f.text} className="flex items-center gap-2">
                <f.icon className="size-4 shrink-0 text-primary" />
                {f.text}
              </li>
            ))}
          </motion.ul>
        </div>

        {/* camera mock */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          <div className="absolute -inset-8 rounded-3xl bg-primary/10 blur-3xl" />
          <div className="corner-frame relative">
            <CameraFeed
              title="ENTRANCE · MAIN"
              status="online"
              views={12847}
              className="aspect-video w-full shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)]"
            />
          </div>

          {/* floating chips */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
            className="glass absolute -left-4 top-6 z-10 flex items-center gap-2 rounded-lg border border-primary/30 px-3 py-2 shadow-xl sm:-left-8"
          >
            <span className="flex size-2">
              <span className="absolute inline-flex size-2 animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
            </span>
            <span className="font-mono text-xs text-foreground">
              hls ready · <span className="text-emerald-400">stream.m3u8</span>
            </span>
          </motion.div>

          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
            className="glass absolute -right-3 bottom-10 z-10 flex items-center gap-2 rounded-lg border border-border px-3 py-2 shadow-xl sm:-right-6"
          >
            <FileCode2 className="size-4 text-primary" />
            <span className="font-mono text-xs text-foreground">
              &lt;iframe src="rtsp.me/embed/…"&gt;
            </span>
          </motion.div>
        </motion.div>
      </div>

      {/* protocol marquee */}
      <div className="container mt-20">
        <div className="relative overflow-hidden rounded-xl border border-border bg-card/60 py-4 mask-fade-x">
          <div className="flex w-max animate-ticker gap-10 pr-10">
            {[...PROTOCOLS, ...PROTOCOLS].map((p, i) => (
              <span
                key={i}
                className="flex items-center gap-10 whitespace-nowrap font-mono text-sm tracking-wider text-muted-foreground"
              >
                {p}
                <span className="size-1.5 rounded-full bg-primary/50" />
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* stats */}
      <div className="container mt-16 sm:mt-20">
        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border/60 sm:grid-cols-3">
          {[
            { label: "Users", value: 2400, suffix: "+" },
            { label: "IP cameras online", value: 8600, suffix: "+" },
            { label: "Views delivered", value: 46000000, suffix: "+" },
          ].map((s) => (
            <div
              key={s.label}
              className={cn(
                "flex flex-col items-center gap-1.5 bg-background/95 px-6 py-9",
                "transition-colors hover:bg-card",
              )}
            >
              <Counter
                value={s.value}
                suffix={s.suffix}
                className="font-display text-3xl font-bold text-foreground sm:text-4xl"
              />
              <span className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                <span className="size-1 rounded-full bg-primary/70" />
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
