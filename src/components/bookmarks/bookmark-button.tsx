"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bookmark, BookmarkCheck } from "lucide-react";
import type { BookmarkType } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Optimistic bookmark toggle. POST /api/bookmarks { type, item_id } → { bookmarked }.
 * Anonymous users are redirected to login with a return path.
 */
export function BookmarkButton({
  type,
  itemId,
  initial = false,
  size = "md",
  className,
  showLabel = false,
  onChange,
}: {
  type: BookmarkType;
  itemId: string;
  initial?: boolean;
  size?: "sm" | "md";
  className?: string;
  showLabel?: boolean;
  onChange?: (bookmarked: boolean) => void;
}) {
  const [on, setOn] = useState(initial);
  const [pending, start] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  // Bookmarks need an account; the static showcase site has none. (After the hooks, to keep hook order stable.)
  if (process.env.NEXT_PUBLIC_STATIC_SITE === "1") return null;

  const toggle = () => {
    const next = !on;
    setOn(next);
    start(async () => {
      try {
        const res = await fetch("/api/bookmarks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type, item_id: itemId }),
        });
        if (res.status === 401) {
          setOn(!next);
          router.push(`/login?next=${encodeURIComponent(pathname)}`);
          return;
        }
        if (!res.ok) throw new Error("failed");
        const data = (await res.json()) as { bookmarked: boolean };
        setOn(data.bookmarked);
        onChange?.(data.bookmarked);
      } catch {
        setOn(!next);
      }
    });
  };

  const Icon = on ? BookmarkCheck : Bookmark;
  const dims = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle();
      }}
      disabled={pending}
      aria-pressed={on}
      aria-label={on ? "Remove bookmark" : "Add bookmark"}
      title={on ? "Remove bookmark" : "Add bookmark"}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-xl border transition-colors",
        showLabel ? "h-10 px-3.5 text-sm font-medium" : dims,
        on ? "border-brand-200 bg-brand-50 text-brand-700" : "border-ink-200 bg-white text-ink-500 hover:bg-ink-50 hover:text-ink-900",
        pending && "opacity-70",
        className,
      )}
    >
      <Icon className={cn(size === "sm" ? "h-4 w-4" : "h-[18px] w-[18px]", on && "fill-current")} aria-hidden="true" />
      {showLabel && (on ? "Saved" : "Save")}
    </button>
  );
}
