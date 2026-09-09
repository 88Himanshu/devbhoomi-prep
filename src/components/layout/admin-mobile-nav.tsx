"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export function AdminMobileNav({ items }: { items: { href: string; label: string }[] }) {
  const pathname = usePathname();
  const [openPath, setOpenPath] = useState<string | null>(null);
  const open = openPath === pathname;
  return (
    <div className="md:hidden">
      <button type="button" onClick={() => setOpenPath(open ? null : pathname)} className="rounded-lg p-2 text-ink-700 hover:bg-ink-100" aria-label="Admin menu" aria-expanded={open}>
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
      {open && (
        <nav className="absolute inset-x-0 top-16 grid grid-cols-2 gap-1 border-b border-ink-200 bg-white p-3 shadow-card">
          {items.map((it) => (
            <Link key={it.href} href={it.href} className="rounded-lg px-3 py-2 text-sm font-medium text-ink-700 hover:bg-ink-100">{it.label}</Link>
          ))}
        </nav>
      )}
    </div>
  );
}
