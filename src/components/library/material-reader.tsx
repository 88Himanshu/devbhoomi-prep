"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/misc";
import { cn } from "@/lib/utils";

/**
 * In-page PDF reader with a page-progress control. Progress is saved to /api/progress
 * (debounced) so the dashboard can show "Continue reading".
 */
export function MaterialReader({ src, itemType, itemId, pages, initialPage, initialPercent, canSave }: {
  src: string; itemType: "book" | "note"; itemId: string; pages: number; initialPage: number; initialPercent: number; canSave: boolean;
}) {
  const [page, setPage] = useState(Math.min(Math.max(1, initialPage), Math.max(1, pages)));
  const [full, setFull] = useState(false);
  const [saved, setSaved] = useState<"idle" | "saving" | "saved">("idle");
  const started = useRef(0);
  const lastSaved = useRef(initialPage);
  const percent = pages ? Math.round((page / pages) * 100) : initialPercent;

  useEffect(() => {
    if (!canSave || page === lastSaved.current) return;
    setSaved("saving");
    const t = setTimeout(async () => {
      const now = Date.now();
      const seconds = started.current ? Math.min(3600, Math.round((now - started.current) / 1000)) : 0;
      started.current = now;
      try {
        await fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ item_type: itemType, item_id: itemId, progress_percent: percent, last_position: page, seconds_spent: seconds }),
        });
        lastSaved.current = page;
        setSaved("saved");
      } catch {
        setSaved("idle");
      }
    }, 800);
    return () => clearTimeout(t);
  }, [page, percent, canSave, itemId, itemType]);

  useEffect(() => {
    if (!full) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setFull(false); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [full]);

  return (
    <div className={cn("flex flex-col rounded-card border border-ink-200 bg-white shadow-card", full && "fixed inset-0 z-50 rounded-none border-0")}>
      <div className="flex flex-wrap items-center gap-2 border-b border-ink-100 px-3 py-2">
        <div className="flex items-center gap-1">
          <Button type="button" variant="ghost" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} aria-label="Previous page"><ChevronLeft className="h-4 w-4" /></Button>
          <label className="flex items-center gap-1.5 text-sm text-ink-700">
            <span className="sr-only">Current page</span>
            <input type="number" min={1} max={pages || undefined} value={page} onChange={(e) => setPage(Math.min(Math.max(1, Number(e.target.value) || 1), pages || 9999))} className="h-8 w-14 rounded-lg border border-ink-200 px-2 text-center text-sm" />
            <span className="text-ink-500">/ {pages || "—"}</span>
          </label>
          <Button type="button" variant="ghost" size="sm" onClick={() => setPage((p) => Math.min(pages || p + 1, p + 1))} disabled={pages > 0 && page >= pages} aria-label="Next page"><ChevronRight className="h-4 w-4" /></Button>
        </div>
        <div className="flex min-w-32 flex-1 items-center gap-2">
          <Progress value={percent} tone="forest" className="h-1.5" label="Reading progress" />
          <span className="w-10 text-right text-xs text-ink-500">{percent}%</span>
        </div>
        <span className="text-[11px] text-ink-500" aria-live="polite">
          {!canSave ? "Sign in to save progress" : saved === "saving" ? "Saving…" : saved === "saved" ? "Progress saved" : ""}
        </span>
        <Button type="button" variant="outline" size="sm" onClick={() => setFull((v) => !v)} aria-label={full ? "Exit full screen" : "Full screen"}>
          {full ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>
      </div>
      <iframe
        key={page}
        src={`${src}#page=${page}&view=FitH`}
        title="Document reader"
        className={cn("w-full bg-ink-100", full ? "flex-1" : "h-[70vh] min-h-[420px]")}
      />
    </div>
  );
}
