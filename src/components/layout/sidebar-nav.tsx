"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Icons arrive as already-rendered elements (serialisable) rather than component
 * references, which cannot cross the server → client boundary.
 */
export function SidebarNav({ items }: { items: { href: string; label: string; exact?: boolean; icon: ReactNode }[] }) {
  const pathname = usePathname();
  return (
    <nav className="grid gap-0.5">
      {items.map((it) => {
        const active = it.exact ? pathname === it.href : pathname === it.href || pathname.startsWith(it.href + "/");
        return (
          <Link
            key={it.href}
            href={it.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
              active ? "bg-brand-50 text-brand-800" : "text-ink-700 hover:bg-ink-100",
            )}
          >
            <span className={cn("inline-flex [&>svg]:h-4 [&>svg]:w-4", active ? "text-brand-700" : "text-ink-500")} aria-hidden="true">
              {it.icon}
            </span>
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
