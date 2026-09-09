import Link from "next/link";
import { cn } from "@/lib/utils";

/** Mountain ridge + open book mark. Uttarakhand-inspired, kept monochrome-friendly. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={cn("h-9 w-9", className)} aria-hidden="true">
      <rect width="40" height="40" rx="10" className="fill-brand-800" />
      <path d="M6 27 L15 14 L20 21 L25 12 L34 27 Z" className="fill-brand-400" />
      <path d="M6 27 L15 14 L20 21 L14.5 27 Z" className="fill-brand-300" />
      <path d="M25 12 L34 27 L27.5 27 L22 19.5 Z" className="fill-brand-300" />
      <path d="M11 31.5 C14.5 29.5 17.5 29.5 20 31.5 C22.5 29.5 25.5 29.5 29 31.5 L29 34 C25.5 32 22.5 32 20 34 C17.5 32 14.5 32 11 34 Z" className="fill-saffron-400" />
      <circle cx="29" cy="10" r="2.2" className="fill-saffron-400" />
    </svg>
  );
}

export function Logo({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2.5", className)} aria-label="Devbhoomi Prep home">
      <LogoMark />
      {!compact && (
        <span className="leading-tight">
          <span className="block text-base font-bold tracking-tight text-brand-900">Devbhoomi Prep</span>
          <span className="block text-[11px] font-medium uppercase tracking-wider text-ink-500">Uttarakhand Exams</span>
        </span>
      )}
    </Link>
  );
}
