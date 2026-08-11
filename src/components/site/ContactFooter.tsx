import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Mail, MapPin, MessageSquare, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Reveal, SectionHeading } from "@/components/site/shared";
import { sendContactMessage } from "@/lib/broadcasts";

function ContactForm() {
  const [sending, setSending] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      subject: String(data.get("subject") ?? ""),
      body: String(data.get("body") ?? ""),
    };

    setSending(true);
    try {
      await sendContactMessage(payload);
      toast.success("Message sent", {
        description: "We'll get back to you within one business day.",
      });
      form.reset();
    } catch (err) {
      toast.error("Couldn't send the message", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" placeholder="Jane Doe" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="jane@company.com" required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="subject">Subject</Label>
        <Input id="subject" name="subject" placeholder="How do I set up port mapping?" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="body">Message</Label>
        <Textarea
          id="body"
          name="body"
          rows={5}
          placeholder="Tell us about your cameras and what you'd like to stream…"
          required
        />
      </div>
      <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={sending}>
        {sending ? <Loader2 className="animate-spin" /> : <Send />}
        {sending ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}

export function Contact() {
  return (
    <section id="contact" className="relative scroll-mt-24 py-20 sm:py-28">
      <div className="container">
        <SectionHeading
          eyebrow="Contact"
          title={
            <>
              Talk to a <span className="text-gradient">human</span>
            </>
          }
          description="Questions about setup, cameras, billing or the API — we answer fast."
        />
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <div className="flex h-full flex-col gap-4">
              {[
                { icon: Mail, title: "Email", text: "support@rtsp.me · sales@rtsp.me" },
                { icon: MessageSquare, title: "Live chat", text: "In the dashboard, 24/7 for active accounts" },
                { icon: MapPin, title: "Data centers", text: "North & South America · Europe · Asia · Australia" },
              ].map((c) => (
                <div key={c.title} className="card-hover flex items-center gap-4 rounded-xl border border-border bg-card p-5">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-primary/10 text-primary">
                    <c.icon className="size-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">{c.title}</div>
                    <div className="font-mono text-xs text-muted-foreground">{c.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.12}>
            <div className="rounded-xl border border-border bg-card p-7 sm:p-8">
              <ContactForm />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border/70 bg-card/40">
      <div className="container grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="mb-4 flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg border border-primary/40 bg-primary/10">
              <span className="size-2.5 rounded-full bg-primary" />
            </span>
            <span className="font-display text-lg font-bold">
              rtsp<span className="text-primary">.me</span>
            </span>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            RTSP streaming for your website in one click. H.264 live video from
            IP cameras, with an embeddable HTML5 player and cloud archive.
          </p>
        </div>

        {[
          {
            title: "Service",
            links: [
              { label: "How it works", href: "#service" },
              { label: "Cloud archive", href: "#cloud" },
              { label: "Requirements", href: "#requirements" },
              { label: "FAQ", href: "#faq" },
            ],
          },
          {
            title: "Developers",
            links: [
              { label: "Embed player", href: "#api" },
              { label: "Streams API", href: "#api" },
              { label: "Copy protection", href: "#benefits" },
              { label: "Status", href: "#" },
            ],
          },
          {
            title: "Company",
            links: [
              { label: "Pricing", href: "#pricing" },
              { label: "Products", href: "#products" },
              { label: "Contact", href: "#contact" },
              { label: "Sign in", href: "/auth" },
            ],
          },
        ].map((col) => (
          <div key={col.title}>
            <h4 className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
              {col.title}
            </h4>
            <ul className="space-y-2.5">
              {col.links.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border/50">
        <div className="container flex flex-col items-center justify-between gap-3 py-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} rtsp.me — RTSP streaming service
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground/70">
            powered by rtsp.me · HLS · H.264 · RTSP
          </p>
        </div>
      </div>
    </footer>
  );
}
