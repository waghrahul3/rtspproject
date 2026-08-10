import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

export function Reveal({
  children,
  delay = 0,
  y = 26,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 0.65, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
}: {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  align?: "center" | "left";
}) {
  return (
    <Reveal
      className={cn(
        "mb-12 flex flex-col gap-4 sm:mb-16",
        align === "center" ? "items-center text-center" : "items-start text-left",
      )}
    >
      <span className="flex items-center gap-2 font-mono text-xs font-medium uppercase tracking-[0.25em] text-primary">
        <span className="h-px w-6 bg-primary/60" />
        {eyebrow}
        <span className="h-px w-6 bg-primary/60" />
      </span>
      <h2 className="max-w-3xl font-display text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl md:text-[2.75rem]">
        {title}
      </h2>
      {description && (
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          {description}
        </p>
      )}
    </Reveal>
  );
}

export function CopyButton({
  text,
  className,
  label = "Copy",
}: {
  text: string;
  className?: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <button
      onClick={copy}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-border bg-background/60 px-2.5 py-1.5 font-mono text-xs text-muted-foreground transition-all hover:border-primary/50 hover:text-primary",
        copied && "border-emerald-500/50 text-emerald-400 hover:text-emerald-400",
        className,
      )}
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      {copied ? "Copied" : label}
    </button>
  );
}
