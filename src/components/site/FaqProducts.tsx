import { useNavigate } from "react-router-dom";
import { Camera, Network, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Reveal, SectionHeading } from "@/components/site/shared";
import { cn } from "@/lib/utils";

const FAQS: { q: string; a: React.ReactNode }[] = [
  {
    q: "How do I find my RTSP link?",
    a: (
      <div className="space-y-3">
        <p>
          The RTSP link is on your camera manufacturer's website or from our
          support. Usually only a few parameters change: IP address, port,
          login, password and stream name. Replace them in the examples:
        </p>
        <div className="space-y-2 font-mono text-xs text-cyan-200/85">
          <div className="rounded-md border border-border/70 bg-[#070b12] px-3 py-2">
            Hikvision · rtsp://admin:pass@8.8.8.8:554/Streaming/Channels/101
          </div>
          <div className="rounded-md border border-border/70 bg-[#070b12] px-3 py-2">
            Dahua · rtsp://admin:pass@8.8.8.8:554/cam/realmonitor?channel=1&subtype=0
          </div>
          <div className="rounded-md border border-border/70 bg-[#070b12] px-3 py-2">
            MyVMS · rtsp://admin:pass@8.8.8.8:9784/cameras/0/streaming/main?audio=1
          </div>
        </div>
      </div>
    ),
  },
  {
    q: "How do I find my static IP address?",
    a: (
      <p>
        A static IP is a permanent unique address assigned to your internet
        connection, for example 78.78.78.78. It's needed for remote access to
        cameras or recorders — ask your ISP to enable it.
      </p>
    ),
  },
  {
    q: "I have a dynamic IP address. Can I set up streaming?",
    a: (
      <p>
        Yes. Services like No-IP, DynDNS or DuckDNS link a domain name to your
        changing IP address. Use that domain in the RTSP link instead of an IP —
        rtsp://user:pass@mycamera.duckdns.org:554/…
      </p>
    ),
  },
  {
    q: "What if I have a private IP address?",
    a: (
      <p>
        Private IPs (RFC 1918: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16) are
        only reachable inside your local network. The clean solution is our{" "}
        <span className="text-primary">MyVMS 5Mp Bullet</span> or{" "}
        <span className="text-primary">MyVMS Bridge</span> devices, which connect
        the camera to the internet for you.
      </p>
    ),
  },
  {
    q: "How do I configure port mapping?",
    a: (
      <p>
        Port mapping (port forwarding) directs internet requests to a device in
        your network. Cameras usually use port 554 for RTSP. With camera IP
        192.168.1.100, forward external port 554 to it (TCP/UDP) in your
        router's admin panel.
      </p>
    ),
  },
  {
    q: "What camera settings are recommended?",
    a: (
      <ul className="list-inside list-disc space-y-1.5">
        <li>Codec — H.264</li>
        <li>FPS — 25</li>
        <li>GOP (I-frame) — 50 frames (2 seconds)</li>
        <li>SMART codec — off</li>
      </ul>
    ),
  },
  {
    q: 'Error: "Local IP cannot be used"',
    a: (
      <p>
        Your camera is on a private network (10.x, 172.16–31.x, 192.168.x) and
        isn't reachable from the internet. Configure port mapping — or use our
        MyVMS hardware to skip networking entirely.
      </p>
    ),
  },
  {
    q: "What are the advantages of the MyVMS 5Mp Bullet camera?",
    a: (
      <p>
        Connect it to the internet and the stream is ready — no static IP or
        port mapping needed. 2592×1944 at 25 fps, wide viewing angle, IP-65
        rated cylindrical metal body, infrared night vision, POE support and
        mounting kit included.
      </p>
    ),
  },
];

const PRODUCTS = [
  {
    name: "MyVMS 5Mp Bullet",
    price: "99",
    tag: "NEW",
    badgeVariant: "default" as const,
    points: [
      "No static IP or port mapping needed",
      "2592 × 1944 @ 25 fps",
      "Wide viewing angle, IP-65 metal body",
      "Infrared night vision · POE · mounting kit",
      "Lens 2.8 mm · setup by our support",
    ],
  },
  {
    name: "MyVMS Bridge",
    price: "50",
    tag: null,
    badgeVariant: "secondary" as const,
    points: [
      "Connects IP cameras without a public IP",
      "Supports up to 8 IP cameras",
      "Plug into your local network",
      "Streaming configured by our technical support",
    ],
  },
];

export default function FaqProducts() {
  const navigate = useNavigate();

  return (
    <>
      {/* FAQ */}
      <section id="faq" className="relative scroll-mt-24 py-20 sm:py-28">
        <div className="container max-w-4xl">
          <SectionHeading
            eyebrow="FAQ"
            title={
              <>
                Answers to <span className="text-gradient">frequent questions</span>
              </>
            }
            description="Networking, RTSP links, camera settings — the things everyone asks before going live."
          />
          <Reveal>
            <Accordion type="single" collapsible className="rounded-xl border border-border bg-card px-6">
              {FAQS.map((f, i) => (
                <AccordionItem key={f.q} value={`item-${i}`}>
                  <AccordionTrigger className="text-base font-medium">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3 leading-relaxed">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        </div>
      </section>

      {/* Products */}
      <section id="products" className="relative scroll-mt-24 py-20 sm:py-28">
        <div className="pointer-events-none absolute right-0 top-1/3 h-[380px] w-[380px] rounded-full bg-primary/8 blur-[130px]" />
        <div className="container relative">
          <SectionHeading
            eyebrow="Products"
            title={
              <>
                Hardware that skips the{" "}
                <span className="text-gradient">network setup</span>
              </>
            }
            description="Don't want to fight with static IPs and port mapping? These devices connect your cameras to the platform automatically."
          />

          <div className="grid gap-6 md:grid-cols-2">
            {PRODUCTS.map((p, i) => (
              <Reveal key={p.name} delay={i * 0.12}>
                <div className="card-hover group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card">
                  {/* camera illustration */}
                  <div className="relative flex h-44 items-center justify-center overflow-hidden border-b border-border/60 bg-gradient-to-br from-[#0a1526] via-[#060b14] to-[#031018]">
                    <div className="absolute inset-0 bg-grid opacity-30" />
                    <Camera className="size-20 text-primary/80 transition-transform duration-500 group-hover:scale-110" />
                    <span className="absolute left-4 top-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      rtsp.me hardware
                    </span>
                    {p.tag && (
                      <Badge className="absolute right-4 top-4 animate-blink">
                        {p.tag}
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-7">
                    <div className="mb-4 flex items-baseline gap-2">
                      <h3 className="font-display text-xl font-semibold">{p.name}</h3>
                      <span className="font-display text-2xl font-bold text-primary">
                        €{p.price}
                      </span>
                    </div>
                    <ul className="mb-7 space-y-2">
                      {p.points.map((pt) => (
                        <li key={pt} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                          <Network className="mt-0.5 size-4 shrink-0 text-primary" />
                          {pt}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="mt-auto w-full"
                      variant={p.badgeVariant === "default" ? "default" : "outline"}
                      onClick={() => navigate("/auth?returnTo=%2Fdashboard")}
                    >
                      <ShoppingCart />
                      Buy — €{p.price}
                    </Button>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.2} className="mt-8">
            <p className={cn("text-center text-sm text-muted-foreground")}>
              Free shipping within the EU · 12-month warranty · setup assistance
              included
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
