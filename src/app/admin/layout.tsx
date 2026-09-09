import type { ReactNode } from "react";
import { Suspense } from "react";
import Link from "next/link";
import { Home } from "lucide-react";
import { requireAdmin } from "@/lib/auth/session";
import { signOut } from "@/lib/auth/actions";
import { Logo } from "@/components/layout/logo";
import { AppShell } from "@/components/layout/app-shell";
import { Container } from "@/components/ui/misc";
import { AdminMobileNav } from "@/components/layout/admin-mobile-nav";
import { ADMIN_NAV } from "@/components/admin/nav";
import { Toast } from "@/components/admin/toast";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await requireAdmin();
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-ink-200 bg-white">
        <Container className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="hidden rounded-full bg-brand-900 px-2.5 py-0.5 text-xs font-semibold text-white sm:inline">Admin</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Link href="/" className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-ink-700 hover:bg-ink-100 sm:flex"><Home className="h-4 w-4" aria-hidden="true" /> View site</Link>
            <span className="hidden text-ink-500 md:inline">{user.email}</span>
            <form action={signOut}><button className="rounded-lg px-3 py-2 font-medium text-ink-700 hover:bg-ink-100">Sign out</button></form>
            <AdminMobileNav items={ADMIN_NAV.map(({ href, label }) => ({ href, label }))} />
          </div>
        </Container>
      </header>
      <main className="flex-1 bg-ink-50/60">
        <AppShell title="Administration" items={ADMIN_NAV}>
          <Suspense fallback={null}><Toast /></Suspense>
          {children}
        </AppShell>
      </main>
    </>
  );
}
