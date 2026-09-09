"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Dialog({ open, onClose, title, children, className, size = "md" }: {
  open: boolean; onClose: () => void; title?: string; children: ReactNode; className?: string; size?: "sm" | "md" | "lg";
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);
  const w = { sm: "max-w-md", md: "max-w-lg", lg: "max-w-3xl" }[size];
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => { if (e.target === ref.current) onClose(); }}
      className={cn("m-auto w-[calc(100%-2rem)] rounded-2xl border border-ink-200 bg-white p-0 text-ink-900 shadow-pop backdrop:bg-ink-900/40", w, className)}
    >
      <div className="p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          {title && <h2 className="text-lg font-semibold">{title}</h2>}
          <button type="button" onClick={onClose} className="-mr-2 -mt-2 rounded-lg p-2 text-ink-500 hover:bg-ink-100" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
