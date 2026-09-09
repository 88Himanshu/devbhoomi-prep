"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface Suggestion { group: string; label: string; href: string; hint?: string }

/** Header search with debounced autocomplete (arrow keys, Enter, Escape). Submits to /search. */
export function SearchBox({ className, autoFocus, defaultValue = "", size = "sm" }: { className?: string; autoFocus?: boolean; defaultValue?: string; size?: "sm" | "lg" }) {
  const [term, setTerm] = useState(defaultValue);
  const [items, setItems] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const router = useRouter();
  const id = useId();
  const wrap = useRef<HTMLDivElement>(null);
  const abort = useRef<AbortController | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Debounced autocomplete, scheduled from the change handler (no effect-driven state). */
  const onInput = (value: string) => {
    setTerm(value);
    if (timer.current) clearTimeout(timer.current);
    const t = value.trim();
    if (t.length < 2) { setItems([]); setOpen(false); return; }
    timer.current = setTimeout(async () => {
      abort.current?.abort();
      const ctrl = new AbortController();
      abort.current = ctrl;
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(t)}`, { signal: ctrl.signal });
        const data = (await res.json()) as { suggestions: Suggestion[] };
        setItems(data.suggestions.slice(0, 10));
        setOpen(true);
        setActive(-1);
      } catch { /* aborted */ }
    }, 250);
  };

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); abort.current?.abort(); }, []);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (!wrap.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const go = () => {
    if (active >= 0 && items[active]) { router.push(items[active].href); setOpen(false); return; }
    if (term.trim()) { router.push(`/search?q=${encodeURIComponent(term.trim())}`); setOpen(false); }
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setActive((a) => Math.min(items.length - 1, a + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(-1, a - 1)); }
    else if (e.key === "Enter") { e.preventDefault(); go(); }
    else if (e.key === "Escape") { setOpen(false); }
  };

  const groups = items.reduce<Record<string, { idx: number; s: Suggestion }[]>>((acc, s, idx) => { (acc[s.group] ??= []).push({ idx, s }); return acc; }, {});

  return (
    <div ref={wrap} className={cn("relative", className)}>
      <form role="search" action="/search" method="get" onSubmit={(e) => { e.preventDefault(); go(); }}>
        <Search className={cn("pointer-events-none absolute top-1/2 -translate-y-1/2 text-ink-500", size === "lg" ? "left-4 h-5 w-5" : "left-3 h-4 w-4")} aria-hidden="true" />
        <input
          type="search"
          name="q"
          value={term}
          onChange={(e) => onInput(e.target.value)}
          onFocus={() => items.length && setOpen(true)}
          onKeyDown={onKey}
          autoFocus={autoFocus}
          autoComplete="off"
          placeholder="Search exams, books, notes, tests…"
          aria-label="Search the platform"
          role="combobox"
          aria-expanded={open && items.length > 0}
          aria-controls={`${id}-list`}
          aria-activedescendant={active >= 0 ? `${id}-opt-${active}` : undefined}
          className={cn(
            "w-full rounded-xl border border-ink-200 bg-ink-50 text-ink-900 placeholder:text-ink-500/80 focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-100",
            size === "lg" ? "h-13 pl-11 pr-4 text-base" : "h-10 pl-9 pr-3 text-sm",
          )}
        />
      </form>
      {open && items.length > 0 && (
        <div id={`${id}-list`} role="listbox" className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-auto rounded-2xl border border-ink-200 bg-white p-1.5 text-sm shadow-pop scrollbar-thin sm:min-w-[380px]">
          {Object.entries(groups).map(([group, list]) => (
            <div key={group}>
              <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-ink-500">{group}</p>
              {list.map(({ idx, s }) => (
                <a
                  key={s.href + s.label}
                  id={`${id}-opt-${idx}`}
                  role="option"
                  aria-selected={active === idx}
                  href={s.href}
                  onMouseEnter={() => setActive(idx)}
                  onClick={(e) => { e.preventDefault(); router.push(s.href); setOpen(false); }}
                  className={cn("flex items-baseline justify-between gap-3 rounded-lg px-3 py-2", active === idx ? "bg-brand-50 text-brand-900" : "text-ink-700 hover:bg-ink-100")}
                >
                  <span className="line-clamp-1">{s.label}</span>
                  {s.hint && <span className="shrink-0 text-xs text-ink-500">{s.hint}</span>}
                </a>
              ))}
            </div>
          ))}
          <button type="button" onClick={go} className="mt-1 w-full rounded-lg px-3 py-2 text-left text-xs font-medium text-brand-700 hover:bg-brand-50">
            See all results for “{term.trim()}” →
          </button>
        </div>
      )}
    </div>
  );
}
