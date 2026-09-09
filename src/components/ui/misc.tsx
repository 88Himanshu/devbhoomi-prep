import type { ComponentProps, ReactNode } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Info, Lock, TriangleAlert, type LucideIcon } from "lucide-react";
import { cn, initials } from "@/lib/utils";
import { ButtonLink } from "./button";

export function Container({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)} {...props} />;
}

export function PageHeader({ eyebrow, title, description, actions, className }: {
  eyebrow?: string; title: string; description?: string; actions?: ReactNode; className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="max-w-2xl">
        {eyebrow && <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-brand-600">{eyebrow}</p>}
        <h1 className="text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">{title}</h1>
        {description && <p className="mt-2 text-sm text-ink-500 sm:text-base">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function SectionHeading({ eyebrow, title, description, align = "left", className }: {
  eyebrow?: string; title: string; description?: string; align?: "left" | "center"; className?: string;
}) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-forest-600">{eyebrow}</p>}
      <h2 className="text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">{title}</h2>
      {description && <p className="mt-3 text-base text-ink-500">{description}</p>}
    </div>
  );
}

export function Progress({ value, className, tone = "brand", label }: { value: number; className?: string; tone?: "brand" | "forest" | "saffron"; label?: string }) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  const bar = { brand: "bg-brand-600", forest: "bg-forest-500", saffron: "bg-saffron-500" }[tone];
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-ink-100", className)} role="progressbar" aria-valuenow={v} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <div className={cn("h-full rounded-full transition-[width] duration-500", bar)} style={{ width: `${v}%` }} />
    </div>
  );
}

export function Stat({ label, value, hint, icon: Icon, tone = "brand", className }: {
  label: string; value: ReactNode; hint?: ReactNode; icon?: LucideIcon; tone?: "brand" | "forest" | "saffron" | "neutral"; className?: string;
}) {
  const iconBg = { brand: "bg-brand-50 text-brand-700", forest: "bg-forest-50 text-forest-700", saffron: "bg-saffron-50 text-saffron-700", neutral: "bg-ink-100 text-ink-700" }[tone];
  return (
    <div className={cn("rounded-card border border-ink-200 bg-white p-5 shadow-card", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-ink-500">{label}</p>
          <p className="mt-1 break-words text-xl font-bold tracking-tight text-ink-900 xl:text-2xl">{value}</p>
          {hint && <div className="mt-1 text-xs text-ink-500">{hint}</div>}
        </div>
        {Icon && (
          <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", iconBg)}>
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
        )}
      </div>
    </div>
  );
}

export function Alert({ tone = "info", title, children, className }: { tone?: "info" | "success" | "warning" | "error"; title?: string; children?: ReactNode; className?: string }) {
  const map = {
    info: ["border-brand-200 bg-brand-50 text-brand-900", Info],
    success: ["border-forest-200 bg-forest-50 text-forest-900", CheckCircle2],
    warning: ["border-saffron-200 bg-saffron-50 text-saffron-800", TriangleAlert],
    error: ["border-red-200 bg-red-50 text-red-800", AlertCircle],
  } as const;
  const [cls, Icon] = map[tone];
  return (
    <div className={cn("flex gap-3 rounded-xl border px-4 py-3 text-sm", cls, className)} role={tone === "error" ? "alert" : "status"}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div>
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={cn(title && "mt-0.5")}>{children}</div>}
      </div>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action, className }: { icon?: LucideIcon; title: string; description?: string; action?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center rounded-card border border-dashed border-ink-300 bg-ink-50/60 px-6 py-14 text-center", className)}>
      {Icon && (
        <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-ink-500 shadow-card">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
      )}
      <p className="text-base font-semibold text-ink-900">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-ink-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/** Locked-content overlay used across library, papers and tests. */
export function PremiumLock({ title = "Premium content", description = "Upgrade to unlock this and everything else in the library.", compact, className }: { title?: string; description?: string; compact?: boolean; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center rounded-card border border-saffron-200 bg-saffron-50/70 text-center", compact ? "px-4 py-6" : "px-6 py-12", className)}>
      <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-white text-saffron-700 shadow-card">
        <Lock className="h-5 w-5" aria-hidden="true" />
      </span>
      <p className="font-semibold text-ink-900">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-ink-700">{description}</p>
      <div className="mt-4 flex gap-2">
        <ButtonLink href="/pricing" variant="saffron" size="sm">Upgrade to Premium</ButtonLink>
        <ButtonLink href="/pricing#compare" variant="outline" size="sm">Compare plans</ButtonLink>
      </div>
    </div>
  );
}

export function Avatar({ name, className, size = "md" }: { name: string; className?: string; size?: "sm" | "md" | "lg" }) {
  const s = { sm: "h-8 w-8 text-xs", md: "h-10 w-10 text-sm", lg: "h-16 w-16 text-xl" }[size];
  return (
    <span className={cn("inline-flex shrink-0 items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-800", s, className)} aria-hidden="true">
      {initials(name)}
    </span>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-ink-100", className)} />;
}

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-ink-500">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {i > 0 && <span aria-hidden="true">/</span>}
            {it.href ? <Link href={it.href} className="hover:text-brand-700">{it.label}</Link> : <span className="text-ink-900">{it.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function Table({ className, ...props }: ComponentProps<"table">) {
  return (
    <div className="w-full overflow-x-auto rounded-card border border-ink-200 bg-white shadow-card">
      <table className={cn("w-full min-w-[640px] text-sm", className)} {...props} />
    </div>
  );
}
export function Th({ className, ...props }: ComponentProps<"th">) {
  return <th className={cn("bg-ink-50 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-500", className)} {...props} />;
}
export function Td({ className, ...props }: ComponentProps<"td">) {
  return <td className={cn("border-t border-ink-100 px-4 py-3 align-middle text-ink-700", className)} {...props} />;
}
