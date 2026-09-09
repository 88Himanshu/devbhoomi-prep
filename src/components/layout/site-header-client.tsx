"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Bookmark, ChevronDown, LayoutDashboard, LogOut, Menu, Settings, Shield, X } from "lucide-react";
import { signOut } from "@/lib/auth/actions";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/misc";
import { Badge } from "@/components/ui/badge";

export function HeaderNav({ items }: { items: { href: string; label: string }[] }) {
  const pathname = usePathname();
  // Menu is "open for a given path": navigating closes it without an effect.
  const [openPath, setOpenPath] = useState<string | null>(null);
  const open = openPath === pathname;
  const setOpen = (v: boolean) => setOpenPath(v ? pathname : null);
  return (
    <>
      <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
        {items.map((it) => {
          const active = pathname === it.href || pathname.startsWith(it.href + "/");
          return (
            <Link
              key={it.href}
              href={it.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active ? "bg-brand-50 text-brand-800" : "text-ink-700 hover:bg-ink-100 hover:text-ink-900",
              )}
            >
              {it.label}
            </Link>
          );
        })}
      </nav>
      <button
        type="button"
        className="ml-auto rounded-lg p-2 text-ink-700 hover:bg-ink-100 lg:hidden"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label="Toggle menu"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
      {open && (
        <div className="absolute inset-x-0 top-16 border-b border-ink-200 bg-white p-4 shadow-card lg:hidden">
          <nav className="grid gap-1" aria-label="Mobile">
            {items.map((it) => (
              <Link key={it.href} href={it.href} className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-100">
                {it.label}
              </Link>
            ))}
            <Link href="/login" className="rounded-lg px-3 py-2.5 text-sm font-medium text-brand-700 hover:bg-brand-50">
              Log in
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}

export function UserMenu({ user, premium, trialDaysLeft }: { user: { name: string; email: string; role: string }; premium: boolean; trialDaysLeft: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const [openPath, setOpenPath] = useState<string | null>(null);
  const open = openPath === pathname;
  const setOpen = (v: boolean) => setOpenPath(v ? pathname : null);
  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-xl py-1 pl-1 pr-2 hover:bg-ink-100"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Avatar name={user.name} size="sm" />
        <span className="hidden max-w-32 truncate text-sm font-medium text-ink-900 sm:block">{user.name.split(" ")[0]}</span>
        <ChevronDown className="h-4 w-4 text-ink-500" aria-hidden="true" />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-pop">
          <div className="border-b border-ink-100 px-4 py-3">
            <p className="truncate text-sm font-semibold text-ink-900">{user.name}</p>
            <p className="truncate text-xs text-ink-500">{user.email}</p>
            <div className="mt-2">
              {user.role === "admin" ? <Badge tone="brand">Admin</Badge> : premium ? <Badge tone="forest">Premium</Badge> : trialDaysLeft > 0 ? <Badge tone="saffron">Trial · {trialDaysLeft}d left</Badge> : <Badge>Free plan</Badge>}
            </div>
          </div>
          <div className="p-1.5 text-sm">
            <MenuLink href="/dashboard" icon={LayoutDashboard}>Dashboard</MenuLink>
            <MenuLink href="/bookmarks" icon={Bookmark}>My Bookmarks</MenuLink>
            <MenuLink href="/profile" icon={Settings}>Profile & Subscription</MenuLink>
            {user.role === "admin" && <MenuLink href="/admin" icon={Shield}>Admin Panel</MenuLink>}
            <form action={signOut}>
              <button type="submit" role="menuitem" className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-ink-700 hover:bg-ink-100">
                <LogOut className="h-4 w-4 text-ink-500" aria-hidden="true" /> Sign out
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuLink({ href, icon: Icon, children }: { href: string; icon: typeof LayoutDashboard; children: React.ReactNode }) {
  return (
    <Link href={href} role="menuitem" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-ink-700 hover:bg-ink-100">
      <Icon className="h-4 w-4 text-ink-500" aria-hidden="true" /> {children}
    </Link>
  );
}
