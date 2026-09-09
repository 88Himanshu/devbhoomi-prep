import type { ReactNode } from "react";
import { Bookmark, ClipboardList, History, LayoutDashboard, LineChart, UserRound } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { getAccess } from "@/lib/access";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { AppShell } from "@/components/layout/app-shell";
import { TrialSidebarCard } from "@/components/layout/trial-card";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/mock-tests", label: "Mock Tests", icon: ClipboardList },
  { href: "/tests/history", label: "Test History", icon: History },
  { href: "/analytics", label: "Analytics", icon: LineChart },
  { href: "/bookmarks", label: "Bookmarks", icon: Bookmark },
  { href: "/profile", label: "Profile", icon: UserRound },
];

export default async function StudentLayout({ children }: { children: ReactNode }) {
  await requireUser();
  const access = await getAccess();
  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-ink-50/60">
        <AppShell title="My learning" items={items} footer={<TrialSidebarCard access={access} />}>
          {children}
        </AppShell>
      </main>
      <SiteFooter />
    </>
  );
}
