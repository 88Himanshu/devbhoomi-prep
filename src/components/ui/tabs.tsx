"use client";

import { createContext, useContext, useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const Ctx = createContext<{ value: string; set: (v: string) => void; id: string } | null>(null);

export function Tabs({ defaultValue, value, onValueChange, children, className }: {
  defaultValue: string; value?: string; onValueChange?: (v: string) => void; children: ReactNode; className?: string;
}) {
  const [inner, setInner] = useState(defaultValue);
  const id = useId();
  const current = value ?? inner;
  const set = (v: string) => { setInner(v); onValueChange?.(v); };
  return <Ctx.Provider value={{ value: current, set, id }}><div className={className}>{children}</div></Ctx.Provider>;
}

export function TabList({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div role="tablist" className={cn("flex gap-1 overflow-x-auto rounded-xl bg-ink-100 p-1 scrollbar-thin", className)}>
      {children}
    </div>
  );
}

export function Tab({ value, children, className }: { value: string; children: ReactNode; className?: string }) {
  const ctx = useContext(Ctx)!;
  const active = ctx.value === value;
  return (
    <button
      role="tab"
      type="button"
      id={`${ctx.id}-tab-${value}`}
      aria-selected={active}
      aria-controls={`${ctx.id}-panel-${value}`}
      onClick={() => ctx.set(value)}
      className={cn(
        "shrink-0 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
        active ? "bg-white text-brand-800 shadow-card" : "text-ink-500 hover:text-ink-900",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function TabPanel({ value, children, className }: { value: string; children: ReactNode; className?: string }) {
  const ctx = useContext(Ctx)!;
  if (ctx.value !== value) return null;
  return (
    <div role="tabpanel" id={`${ctx.id}-panel-${value}`} aria-labelledby={`${ctx.id}-tab-${value}`} className={cn("mt-5", className)}>
      {children}
    </div>
  );
}
