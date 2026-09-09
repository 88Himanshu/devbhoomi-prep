import Link from "next/link";
import { ArrowRight, BarChart3, BookOpen, ClipboardCheck, FileText, Megaphone, Quote, UserPlus, type LucideIcon } from "lucide-react";
import type { Announcement } from "@/lib/types";
import { Container, SectionHeading } from "@/components/ui/misc";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Section({ id, children, className, tone = "white" }: { id?: string; children: React.ReactNode; className?: string; tone?: "white" | "muted" | "brand" }) {
  const bg = { white: "bg-white", muted: "bg-ink-50", brand: "bg-brand-900 text-white" }[tone];
  return (
    <section id={id} className={cn("py-16 sm:py-20", bg, className)}>
      <Container>{children}</Container>
    </section>
  );
}

export function SectionHeader({ eyebrow, title, description, href, linkLabel = "View all" }: { eyebrow?: string; title: string; description?: string; href?: string; linkLabel?: string }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <SectionHeading eyebrow={eyebrow} title={title} description={description} />
      {href && (
        <Link href={href} className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-900">
          {linkLabel} <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}

export function AnnouncementBanner({ items }: { items: Announcement[] }) {
  const a = items[0];
  if (!a) return null;
  return (
    <div className="border-b border-saffron-200 bg-saffron-50">
      <Container className="flex flex-col gap-2 py-2.5 text-sm text-ink-900 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-start gap-2">
          <Megaphone className="mt-0.5 h-4 w-4 shrink-0 text-saffron-700" aria-hidden="true" />
          <span><span className="font-semibold">{a.title}</span> {a.body && <span className="text-ink-700">— {a.body}</span>}</span>
        </p>
        {a.link_url && (
          <Link href={a.link_url} className="shrink-0 text-sm font-semibold text-brand-700 hover:underline">{a.link_label ?? "Learn more"} →</Link>
        )}
      </Container>
    </div>
  );
}

export function TrustStrip({ stats }: { stats: { label: string; value: string; icon: LucideIcon }[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {stats.map(({ label, value, icon: Icon }) => (
        <div key={label} className="flex items-center gap-3 rounded-2xl border border-ink-200 bg-white p-4 shadow-card">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-lg font-bold tracking-tight text-ink-900">{value}</p>
            <p className="truncate text-xs text-ink-500">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

const STEPS = [
  { icon: UserPlus, title: "Create your free account", text: "Sign up in a minute. Your 30-day free trial starts automatically — no card needed." },
  { icon: BookOpen, title: "Pick your exam & study", text: "Follow the syllabus with original notes, books and a week-by-week study plan." },
  { icon: ClipboardCheck, title: "Practise with real papers", text: "Attempt previous-year papers and timed mock tests built to the actual exam pattern." },
  { icon: BarChart3, title: "Track & improve", text: "See accuracy by subject, weak areas and score trends, then retake to improve." },
];

export function HowItWorks() {
  return (
    <ol className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
      {STEPS.map(({ icon: Icon, title, text }, i) => (
        <li key={title} className="relative rounded-2xl border border-ink-200 bg-white p-6 shadow-card">
          <span className="absolute right-5 top-5 text-4xl font-bold text-ink-100" aria-hidden="true">{i + 1}</span>
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest-50 text-forest-700">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
          <h3 className="mt-4 text-base font-semibold text-ink-900">{title}</h3>
          <p className="mt-1.5 text-sm text-ink-500">{text}</p>
        </li>
      ))}
    </ol>
  );
}

const TESTIMONIALS = [
  { name: "Aarav Rawat", place: "Pauri Garhwal", exam: "UKSSSC aspirant", quote: "The Uttarakhand GK notes are compact and accurate. Subject-wise accuracy charts showed me I was losing marks in reasoning, so that's where I spent my last month." },
  { name: "Priya Negi", place: "Almora", exam: "Patwari / Lekhpal", quote: "Attempting previous-year papers with a timer felt very close to the real exam. The explanations after each test are the most useful part for me." },
  { name: "Rohit Bisht", place: "Dehradun", exam: "Uttarakhand Police", quote: "I used the free trial first and then took the 3-month plan. Mock test rank and percentile kept me honest about where I actually stood." },
  { name: "Kavita Joshi", place: "Nainital", exam: "UTET", quote: "Pedagogy questions with clear explanations were hard to find elsewhere. The study plan kept my preparation organised week by week." },
  { name: "Deepak Pant", place: "Pithoragarh", exam: "Forest Guard", quote: "Bilingual notes helped me a lot since I prefer Hindi. The mobile site works well on my phone during travel." },
  { name: "Sunita Bhandari", place: "Haridwar", exam: "UKPSC", quote: "Honest platform — no big promises, just good material, tests and analytics that show exactly what to fix next." },
];

export function Testimonials() {
  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {TESTIMONIALS.map((t) => (
        <figure key={t.name} className="flex flex-col rounded-2xl border border-ink-200 bg-white p-6 shadow-card">
          <Quote className="h-5 w-5 text-brand-300" aria-hidden="true" />
          <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-ink-700">{t.quote}</blockquote>
          <figcaption className="mt-5 flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-800" aria-hidden="true">
              {t.name.split(" ").map((p) => p[0]).join("")}
            </span>
            <div>
              <p className="text-sm font-semibold text-ink-900">{t.name}</p>
              <p className="text-xs text-ink-500">{t.exam} · {t.place}</p>
            </div>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

export function FinalCta({ signedIn }: { signedIn: boolean }) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-brand-900 px-6 py-14 text-center text-white sm:px-12">
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-700/50 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-forest-600/40 blur-3xl" aria-hidden="true" />
      <div className="relative">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Start preparing for your Uttarakhand exam today</h2>
        <p className="mx-auto mt-3 max-w-xl text-brand-100">30 days free. Books, notes, previous-year papers, mock tests and analytics in one place.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          {signedIn ? (
            <ButtonLink href="/dashboard" variant="saffron" size="lg">Go to Dashboard</ButtonLink>
          ) : (
            <>
              <ButtonLink href="/signup" variant="saffron" size="lg">Start 30 Days Free Trial</ButtonLink>
              <ButtonLink href="/exams" variant="outline" size="lg" className="border-brand-600 bg-transparent text-white hover:bg-brand-800">Explore Courses</ButtonLink>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export const ICONS = { FileText, BookOpen, ClipboardCheck, BarChart3 };
