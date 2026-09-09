"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input, Select } from "@/components/ui/form";
import { cn } from "@/lib/utils";

export interface FilterOption { value: string; label: string }
export interface FilterDef { name: string; label: string; options: FilterOption[]; value?: string; allLabel?: string }

/**
 * GET filter bar: selects auto-submit; text search is debounced. Works without JS too.
 * `basePath` receives the query string; unknown params are dropped.
 */
export function FilterBar({ basePath, q, filters, placeholder = "Search…", extra, className }: {
  basePath: string; q?: string; filters: FilterDef[]; placeholder?: string; extra?: ReactNode; className?: string;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [term, setTerm] = useState(q ?? "");
  const [open, setOpen] = useState(false);
  const first = useRef(true);

  const submit = () => {
    const form = formRef.current;
    if (!form) return;
    const data = new FormData(form);
    const params = new URLSearchParams();
    data.forEach((v, k) => { if (typeof v === "string" && v.trim()) params.set(k, v.trim()); });
    router.push(`${basePath}${params.toString() ? `?${params}` : ""}`);
  };

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const t = setTimeout(submit, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term]);

  const active = filters.filter((f) => f.value).length + (q ? 1 : 0);

  return (
    <form ref={formRef} action={basePath} method="get" onSubmit={(e) => { e.preventDefault(); submit(); }} className={cn("rounded-card border border-ink-200 bg-white p-3 shadow-card", className)} role="search">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" aria-hidden="true" />
          <Input name="q" value={term} onChange={(e) => setTerm(e.target.value)} placeholder={placeholder} className="pl-9" aria-label="Search" />
          {term && (
            <button type="button" onClick={() => setTerm("")} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-ink-500 hover:bg-ink-100" aria-label="Clear search">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <button type="button" onClick={() => setOpen((v) => !v)} className={cn("inline-flex h-11 items-center gap-1.5 rounded-xl border px-3.5 text-sm font-medium lg:hidden", open ? "border-brand-200 bg-brand-50 text-brand-800" : "border-ink-200 text-ink-700")} aria-expanded={open}>
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" /> Filters{active ? ` (${active})` : ""}
        </button>
      </div>
      <div className={cn("mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-6", !open && "hidden lg:grid")}>
        {filters.map((f) => (
          <Select key={f.name} name={f.name} defaultValue={f.value ?? ""} onChange={submit} aria-label={f.label} className="h-10 text-[13px]">
            <option value="">{f.allLabel ?? `All ${f.label.toLowerCase()}`}</option>
            {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </Select>
        ))}
        {extra}
        {active > 0 && (
          <button type="button" onClick={() => router.push(basePath)} className="h-10 rounded-xl px-3 text-[13px] font-medium text-ink-500 hover:bg-ink-100 hover:text-ink-900">Clear all</button>
        )}
      </div>
    </form>
  );
}
