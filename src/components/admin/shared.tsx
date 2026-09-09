import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Checkbox, Input, Label, Select } from "@/components/ui/form";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/** GET filter bar: inputs submit as query params on the same page. */
export function FilterBar({ children, action, reset }: { children: ReactNode; action?: string; reset?: string }) {
  return (
    <form action={action} className="mb-4 flex flex-wrap items-end gap-2 rounded-card border border-ink-200 bg-white p-3 shadow-card">
      {children}
      <Button type="submit" variant="secondary" size="sm" className="h-10">Apply</Button>
      {reset && <ButtonLink href={reset} variant="ghost" size="sm" className="h-10">Reset</ButtonLink>}
    </form>
  );
}

export function FilterInput({ name, placeholder, defaultValue, className }: { name: string; placeholder?: string; defaultValue?: string; className?: string }) {
  return <Input name={name} placeholder={placeholder} defaultValue={defaultValue} className={cn("h-10 w-48", className)} />;
}

export function FilterSelect({ name, defaultValue, options, className, allLabel = "All" }: { name: string; defaultValue?: string; options: { value: string; label: string }[]; className?: string; allLabel?: string }) {
  return (
    <Select name={name} defaultValue={defaultValue ?? ""} className={cn("h-10 w-44", className)}>
      <option value="">{allLabel}</option>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </Select>
  );
}

export function Toggle({ name, label, defaultChecked, hint }: { name: string; label: string; defaultChecked?: boolean; hint?: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-ink-200 px-3.5 py-3 hover:bg-ink-50">
      <Checkbox name={name} defaultChecked={defaultChecked} className="mt-0.5" />
      <span>
        <span className="block text-sm font-medium text-ink-900">{label}</span>
        {hint && <span className="block text-xs text-ink-500">{hint}</span>}
      </span>
    </label>
  );
}

export function FormShell({ title, description, children, aside }: { title: string; description?: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <div className={cn("grid gap-6", aside && "lg:grid-cols-[1fr_320px]")}>
      <Card>
        <CardHeader>
          <div>
            <CardTitle>{title}</CardTitle>
            {description && <p className="mt-1 text-sm text-ink-500">{description}</p>}
          </div>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
      {aside && <div className="space-y-4">{aside}</div>}
    </div>
  );
}

export function Grid2({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}

export function Pagination({ page, pageSize, total, basePath, params }: { page: number; pageSize: number; total: number; basePath: string; params: Record<string, string | undefined> }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const link = (p: number) => {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v) q.set(k, v);
    q.set("page", String(p));
    return `${basePath}?${q}`;
  };
  return (
    <div className="mt-4 flex items-center justify-between text-sm text-ink-500">
      <span>Showing {total === 0 ? 0 : (page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}</span>
      <div className="flex items-center gap-1">
        <Link aria-disabled={page <= 1} href={link(Math.max(1, page - 1))} className={cn("rounded-lg p-2 hover:bg-ink-100", page <= 1 && "pointer-events-none opacity-40")}><ChevronLeft className="h-4 w-4" /></Link>
        <span className="px-2">Page {page} / {pages}</span>
        <Link aria-disabled={page >= pages} href={link(Math.min(pages, page + 1))} className={cn("rounded-lg p-2 hover:bg-ink-100", page >= pages && "pointer-events-none opacity-40")}><ChevronRight className="h-4 w-4" /></Link>
      </div>
    </div>
  );
}

export function KeyValue({ items }: { items: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
      {items.map((it) => (
        <div key={it.label} className="flex justify-between gap-4 border-b border-ink-100 py-1.5">
          <dt className="text-ink-500">{it.label}</dt>
          <dd className="text-right font-medium text-ink-900">{it.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export { Label };
