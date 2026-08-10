import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { Eye, Radio, VideoOff } from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";

interface CameraFeedProps {
  title?: string;
  status?: "online" | "offline";
  hlsUrl?: string;
  views?: number;
  compact?: boolean;
  className?: string;
}

function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

export default function CameraFeed({
  title = "CAM 01",
  status = "online",
  hlsUrl,
  views = 0,
  compact = false,
  className,
}: CameraFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hlsReady, setHlsReady] = useState(false);
  const now = useNow();

  const time = now.toLocaleTimeString("en-GB", { hour12: false });
  const date = now.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  useEffect(() => {
    if (!hlsUrl || !videoRef.current) return;
    let hls: Hls | null = null;

    if (Hls.isSupported()) {
      hls = new Hls({ enableWorker: true });
      hls.loadSource(hlsUrl);
      hls.attachMedia(videoRef.current);
      hls.on(Hls.Events.MANIFEST_PARSED, () => setHlsReady(true));
      hls.on(Hls.Events.ERROR, (_evt, data) => {
        if (data.fatal) setHlsReady(false);
      });
    } else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
      videoRef.current.src = hlsUrl;
      setHlsReady(true);
    }

    return () => {
      hls?.destroy();
    };
  }, [hlsUrl]);

  const online = status === "online";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-border bg-[#04070d]",
        className,
      )}
    >
      {/* Real HLS video */}
      <video
        ref={videoRef}
        muted
        autoPlay
        playsInline
        className={cn(
          "absolute inset-0 h-full w-full object-cover transition-opacity duration-500",
          hlsReady ? "opacity-100" : "opacity-0",
        )}
      />

      {/* Simulated feed (shown when no HLS source or not ready) */}
      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-500",
          hlsReady ? "opacity-0" : "opacity-100",
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1526] via-[#060b14] to-[#031018]" />
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 30% 35%, hsl(199 90% 50% / 0.18), transparent 55%), radial-gradient(circle at 72% 68%, hsl(187 95% 55% / 0.12), transparent 50%)",
          }}
        />
        {/* fake moving "scene" shapes */}
        <div className="absolute left-[12%] top-[22%] h-24 w-40 rounded-lg border border-cyan-400/10 bg-gradient-to-br from-cyan-400/10 to-transparent blur-[1px]" />
        <div className="absolute bottom-[18%] left-[30%] h-16 w-56 rounded-md border border-slate-500/10 bg-slate-400/5" />
        <div className="absolute right-[10%] top-[30%] h-20 w-32 rounded-md border border-slate-500/10 bg-slate-400/5" />
        {online && (
          <div className="scanline-bar" style={{ animationDuration: "5.5s" }} />
        )}
      </div>

      {/* scanlines + frame overlay */}
      {!hlsReady && <div className="pointer-events-none absolute inset-0 scanlines" />}

      {/* vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ boxShadow: "inset 0 0 80px 24px rgba(0,0,0,0.55)" }}
      />

      {/* HUD: top */}
      <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-2 p-3 sm:p-4">
        <div className="flex items-center gap-2 rounded-md border border-white/10 bg-black/50 px-2 py-1 backdrop-blur-sm">
          <span className="size-1.5 rounded-full bg-primary glow-dot-ok" />
          <span className="font-mono text-[10px] font-medium tracking-wider text-cyan-100/90 sm:text-[11px]">
            {title}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {online ? (
            <span className="flex items-center gap-1.5 rounded-md border border-red-500/30 bg-red-500/15 px-2 py-1 font-mono text-[10px] font-semibold tracking-widest text-red-400 sm:text-[11px]">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-red-500" />
              </span>
              LIVE
            </span>
          ) : (
            <span className="flex items-center gap-1.5 rounded-md border border-white/10 bg-black/50 px-2 py-1 font-mono text-[10px] font-semibold tracking-widest text-slate-400 sm:text-[11px]">
              <VideoOff className="size-3" />
              OFFLINE
            </span>
          )}
          <span className="hidden items-center gap-1 rounded-md border border-white/10 bg-black/50 px-2 py-1 font-mono text-[10px] text-cyan-200/80 sm:flex">
            <span className="size-1.5 animate-blink rounded-full bg-red-500 glow-dot" />
            REC
          </span>
        </div>
      </div>

      {/* HUD: bottom */}
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3 sm:p-4">
        <div className="font-mono text-[10px] leading-relaxed text-cyan-100/70 sm:text-[11px]">
          <div className="text-[9px] uppercase tracking-widest text-slate-500 sm:text-[10px]">
            H.264 · 2592×1944 · 25fps
          </div>
          <div>
            {date} · {time}
          </div>
        </div>
        <div className="flex items-center gap-1.5 rounded-md border border-white/10 bg-black/50 px-2 py-1 font-mono text-[10px] text-cyan-100/80 sm:text-[11px]">
          <Eye className="size-3 text-primary" />
          {formatNumber(views)}
        </div>
      </div>

      {/* signal rings for offline */}
      {!online && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <div className="relative flex size-16 items-center justify-center">
            <span className="absolute inset-0 animate-pulse-ring rounded-full border border-red-500/40" />
            <span className="absolute inset-0 animate-pulse-ring rounded-full border border-red-500/30 [animation-delay:0.6s]" />
            <Radio className="size-7 text-red-400/80" />
          </div>
          <span className="font-mono text-xs tracking-widest text-red-300/80">
            SIGNAL LOST
          </span>
        </div>
      )}
    </div>
  );
}
