import type { ComponentProps } from "react";
import { Lock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "brand" | "forest" | "saffron" | "red" | "outline";

const tones: Record<Tone, string> = {
  neutral: "bg-ink-100 text-ink-700",
  brand: "bg-brand-50 text-brand-800",
  forest: "bg-forest-50 text-forest-700",
  saffron: "bg-saffron-50 text-saffron-800",
  red: "bg-red-50 text-red-700",
  outline: "border border-ink-200 text-ink-700",
};

export function Badge({ tone = "neutral", className, ...props }: ComponentProps<"span"> & { tone?: Tone }) {
  return (
    <span
      className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium", tones[tone], className)}
      {...props}
    />
  );
}

export function PremiumBadge({ locked = true, className }: { locked?: boolean; className?: string }) {
  return (
    <Badge tone={locked ? "saffron" : "forest"} className={className}>
      {locked ? <Lock className="h-3 w-3" aria-hidden="true" /> : <Sparkles className="h-3 w-3" aria-hidden="true" />}
      Premium
    </Badge>
  );
}

export function FreeBadge({ className }: { className?: string }) {
  return (
    <Badge tone="forest" className={className}>
      Free
    </Badge>
  );
}

export const difficultyTone = (d: string): Tone => (d === "easy" ? "forest" : d === "hard" ? "red" : "saffron");
