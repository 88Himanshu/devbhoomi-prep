import Link from "next/link";
import { ArrowRight, BookOpen, ClipboardList, Landmark, type LucideIcon, ServerCog } from "lucide-react";
import { Container } from "@/components/ui/misc";
import { ButtonLink } from "@/components/ui/button";

/**
 * Shown on the static showcase (GitHub Pages) wherever a feature needs the server:
 * accounts, test attempts, payments, bookmarks and the admin panel.
 */
export function PlatformNotice({ icon: Icon = ServerCog, title, description, feature }: {
  icon?: LucideIcon; title: string; description: string; feature?: string;
}) {
  return (
    <Container className="max-w-3xl py-16 sm:py-24">
      <div className="rounded-card border border-ink-200 bg-white p-8 text-center shadow-card sm:p-12">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
          <Icon className="h-7 w-7" aria-hidden="true" />
        </span>
        <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-brand-600">Public showcase</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">{title}</h1>
        <p className="mx-auto mt-3 max-w-xl text-base text-ink-500">{description}</p>
        <div className="mx-auto mt-6 max-w-xl rounded-xl bg-ink-50 px-4 py-3 text-left text-sm text-ink-700">
          <p>
            You are viewing the static preview of Devbhoomi Prep. {feature ?? "This feature"} runs on the full platform, which
            includes student accounts, a 30-day free trial, timed mock tests with analytics, secure Razorpay payments and the
            admin panel. Everything you can browse here — exam guides, the library, previous-year papers and the mock-test
            catalogue — is exactly what students see on the full site.
          </p>
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <NoticeLink href="/exams" icon={Landmark} label="Browse exams" />
          <NoticeLink href="/mock-tests" icon={ClipboardList} label="Mock tests" />
          <NoticeLink href="/books" icon={BookOpen} label="Books & notes" />
        </div>
        <ButtonLink href="/" variant="ghost" size="sm" className="mt-6">Back to home</ButtonLink>
      </div>
    </Container>
  );
}

function NoticeLink({ href, icon: Icon, label }: { href: string; icon: LucideIcon; label: string }) {
  return (
    <Link href={href} className="flex items-center justify-between rounded-xl border border-ink-200 px-4 py-3 text-sm font-medium text-ink-900 transition-colors hover:border-brand-300 hover:bg-brand-50">
      <span className="flex items-center gap-2"><Icon className="h-4 w-4 text-brand-700" aria-hidden="true" />{label}</span>
      <ArrowRight className="h-4 w-4 text-ink-500" aria-hidden="true" />
    </Link>
  );
}
