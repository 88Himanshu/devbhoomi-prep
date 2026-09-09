"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/** Sticky in-page navigation for exam detail sections; highlights the section in view. */
export function ExamNav({ sections }: { sections: { id: string; label: string }[] }) {
  const [active, setActive] = useState(sections[0]?.id);
  useEffect(() => {
    const els = sections.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    if (!els.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-120px 0px -60% 0px", threshold: 0 },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [sections]);
  return (
    <nav aria-label="Exam sections" className="sticky top-16 z-30 -mx-4 border-b border-ink-200 bg-white/95 backdrop-blur sm:-mx-6 lg:-mx-8">
      <div className="flex gap-1 overflow-x-auto px-4 py-2 scrollbar-thin sm:px-6 lg:px-8">
        {sections.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className={cn(
              "shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              active === s.id ? "bg-brand-50 text-brand-800" : "text-ink-500 hover:bg-ink-100 hover:text-ink-900",
            )}
            aria-current={active === s.id ? "location" : undefined}
          >
            {s.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
