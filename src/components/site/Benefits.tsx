import {
  AudioLines,
  CalendarClock,
  CreditCard,
  HardDrive,
  MonitorSmartphone,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { Reveal, SectionHeading } from "@/components/site/shared";

const BENEFITS = [
  {
    icon: Sparkles,
    title: "Ease of use",
    text: "Set up streams with no technical knowledge. Paste the RTSP link and copy the player code.",
  },
  {
    icon: MonitorSmartphone,
    title: "Any device",
    text: "Watch on computers, tablets and phones — Windows, Linux, macOS, Android and iOS.",
  },
  {
    icon: ShieldCheck,
    title: "Security & privacy",
    text: "Real IP addresses and camera credentials stay hidden. Your materials remain confidential.",
  },
  {
    icon: CalendarClock,
    title: "Broadcast schedule",
    text: "Set days and hours when each broadcast is available to viewers. Pause it automatically.",
  },
  {
    icon: CreditCard,
    title: "Flexible pricing",
    text: "Post-payment: stream all month and receive an invoice after. Additional cameras from 5€/month.",
  },
  {
    icon: HardDrive,
    title: "Recording & storage",
    text: "Save streams to a cloud archive and revisit them later — retention up to 360 days.",
  },
  {
    icon: AudioLines,
    title: "Audio support",
    text: "Transmit sound from your camera along with the video — enabled free in stream settings.",
  },
  {
    icon: Users,
    title: "Stream copy protection",
    text: "A tiny PHP snippet generates unique links per user. Copies can't be reused elsewhere.",
  },
];

export default function Benefits() {
  return (
    <section className="relative py-20 sm:py-28">
      <div className="container">
        <SectionHeading
          eyebrow="Benefits"
          title={
            <>
              Why teams choose{" "}
              <span className="text-gradient">our streaming service</span>
            </>
          }
          description="Everything you need to run reliable live surveillance on the public web — without running a media infrastructure."
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map((b, i) => (
            <Reveal key={b.title} delay={(i % 4) * 0.08}>
              <div className="card-hover group h-full rounded-xl border border-border bg-card p-6">
                <div className="mb-4 flex size-11 items-center justify-center rounded-lg border border-primary/25 bg-primary/10 text-primary transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-110">
                  <b.icon className="size-5" />
                </div>
                <h3 className="mb-2 font-display text-base font-semibold">{b.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{b.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
