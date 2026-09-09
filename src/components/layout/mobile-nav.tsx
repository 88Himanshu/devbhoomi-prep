"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, ClipboardList, Home, Landmark, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/exams", label: "Exams", icon: Landmark },
  { href: "/mock-tests", label: "Tests", icon: ClipboardList },
  { href: "/books", label: "Library", icon: BookOpen },
  { href: "/profile", label: "Profile", icon: UserRound },
];

/** Bottom navigation for signed-in students on small screens. Hidden during a test attempt. */
export function MobileBottomNav() {
  const pathname = usePathname();
  if (pathname.startsWith("/tests/attempt") || pathname.startsWith("/admin")) return null;
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      aria-label="Mobile navigation"
    >
      <ul className="grid grid-cols-5">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <li key={href}>
              <Link href={href} className={cn("flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium", active ? "text-brand-700" : "text-ink-500")} aria-current={active ? "page" : undefined}>
                <Icon className={cn("h-5 w-5", active && "stroke-[2.4]")} aria-hidden="true" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
