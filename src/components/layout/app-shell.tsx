import Link from "next/link";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Container } from "@/components/ui/misc";
import { SidebarNav } from "./sidebar-nav";

export interface NavItem { href: string; label: string; icon: LucideIcon; exact?: boolean }

/**
 * Two-column shell for the student area and admin panel: sticky sidebar on md+,
 * full-width content on mobile (bottom nav handles primary navigation there).
 */
export function AppShell({ items, title, children, footer }: { items: NavItem[]; title: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <Container className="grid gap-8 py-6 pb-24 md:grid-cols-[220px_1fr] md:py-8 md:pb-12 lg:grid-cols-[240px_1fr]">
      <aside className="hidden md:block">
        <div className="sticky top-24">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-ink-500">{title}</p>
          <SidebarNav items={items.map(({ href, label, exact, icon: Icon }) => ({ href, label, exact, icon: <Icon /> }))} />
          {footer && <div className="mt-6 px-1">{footer}</div>}
        </div>
      </aside>
      <div className="min-w-0">{children}</div>
    </Container>
  );
}

export function SidebarLinkFallback({ href, children }: { href: string; children: ReactNode }) {
  return <Link href={href}>{children}</Link>;
}
