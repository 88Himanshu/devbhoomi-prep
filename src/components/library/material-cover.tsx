import { cn } from "@/lib/utils";

/** Generated cover art: coloured panel with title initials (no external images). */
export function MaterialCover({ title, color, kind, className, size = "md" }: { title: string; color: string; kind: "book" | "note"; className?: string; size?: "sm" | "md" | "lg" }) {
  const initials = title
    .replace(/[()[\]:–-]/g, " ")
    .split(/\s+/)
    .filter((w) => w && !/^(the|of|and|for|in|a|an|vol)$/i.test(w))
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
  const text = { sm: "text-lg", md: "text-2xl", lg: "text-4xl" }[size];
  return (
    <div
      className={cn("relative flex items-center justify-center overflow-hidden rounded-xl text-white", className)}
      style={{ background: `linear-gradient(145deg, ${color} 0%, ${color}cc 100%)` }}
      aria-hidden="true"
    >
      <div className="absolute inset-y-0 left-0 w-2 bg-white/20" />
      <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/10" />
      <div className="absolute -bottom-8 -left-2 h-24 w-24 rounded-full bg-black/10" />
      <span className={cn("relative font-bold tracking-tight", text)}>{initials || (kind === "book" ? "B" : "N")}</span>
      <span className="absolute bottom-2 right-2 rounded-md bg-white/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
        {kind}
      </span>
    </div>
  );
}
