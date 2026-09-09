import Link from "next/link";
import { ArrowRight, BookOpen, Bookmark, ClipboardList, Flame, HelpCircle, NotebookPen, Play, Target, TrendingUp } from "lucide-react";
import type { MockTest, TestAttempt } from "@/lib/types";
import type { ContinueItem, SubjectStat } from "@/lib/services/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, PremiumBadge, difficultyTone } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState, Progress } from "@/components/ui/misc";
import { DIFFICULTY_LABELS, formatDate, cn } from "@/lib/utils";

function SectionCard({ title, icon: Icon, href, hrefLabel = "View all", children, className }: {
  title: string; icon: typeof BookOpen; href?: string; hrefLabel?: string; children: React.ReactNode; className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader className="items-center">
        <CardTitle className="flex items-center gap-2"><Icon className="h-4 w-4 text-brand-700" aria-hidden="true" /> {title}</CardTitle>
        {href && <Link href={href} className="flex items-center gap-1 text-xs font-semibold text-brand-700 hover:underline">{hrefLabel} <ArrowRight className="h-3 w-3" aria-hidden="true" /></Link>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function ContinueLearning({ items, inProgress }: { items: ContinueItem[]; inProgress: TestAttempt | null }) {
  const empty = items.length === 0 && !inProgress;
  return (
    <SectionCard title="Continue learning" icon={Play} href="/books" hrefLabel="Browse library">
      {empty ? (
        <EmptyState icon={BookOpen} title="Nothing in progress" description="Open a book or note from the library and your place is saved here." className="py-8" />
      ) : (
        <ul className="grid gap-3">
          {inProgress && (
            <li className="flex items-center gap-3 rounded-xl border border-saffron-200 bg-saffron-50 p-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-saffron-700 shadow-card"><ClipboardList className="h-4 w-4" aria-hidden="true" /></span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink-900">{inProgress.title}</p>
                <p className="text-xs text-ink-500">Test in progress · started {formatDate(inProgress.started_at)}</p>
              </div>
              <ButtonLink href={`/tests/attempt/${inProgress.id}`} size="sm" variant="saffron">Resume</ButtonLink>
            </li>
          )}
          {items.map(({ kind, material, progress }) => (
            <li key={progress.id} className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white" style={{ background: material.cover_color }}>
                {kind === "book" ? <BookOpen className="h-4 w-4" aria-hidden="true" /> : <NotebookPen className="h-4 w-4" aria-hidden="true" />}
              </span>
              <div className="min-w-0 flex-1">
                <Link href={`/${kind === "book" ? "books" : "notes"}/${material.slug}`} className="block truncate text-sm font-medium text-ink-900 hover:text-brand-700">{material.title}</Link>
                <div className="mt-1 flex items-center gap-2">
                  <Progress value={progress.progress_percent} className="h-1.5" label={`${material.title} progress`} />
                  <span className="shrink-0 text-xs text-ink-500">{progress.progress_percent}%{progress.last_position ? ` · p.${progress.last_position}` : ""}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}

export function RecommendedTests({ tests, examNames, canAccessPremium }: { tests: MockTest[]; examNames: Map<string, string>; canAccessPremium: boolean }) {
  return (
    <SectionCard title="Recommended tests" icon={Target} href="/mock-tests" hrefLabel="All tests">
      {tests.length === 0 ? (
        <EmptyState icon={ClipboardList} title="You&apos;ve attempted everything!" description="Retake a test to improve your score." className="py-8" />
      ) : (
        <ul className="grid gap-2.5">
          {tests.map((t) => {
            const locked = t.is_premium && !canAccessPremium;
            return (
              <li key={t.id} className="flex items-center gap-3 rounded-xl border border-ink-100 p-3">
                <div className="min-w-0 flex-1">
                  <Link href={`/mock-tests/${t.slug}`} className="block truncate text-sm font-medium text-ink-900 hover:text-brand-700">{t.title}</Link>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-500">
                    <span>{examNames.get(t.exam_id) ?? "Exam"}</span>
                    <span>· {t.question_count} Qs · {t.duration_minutes} min</span>
                    <Badge tone={difficultyTone(t.difficulty)}>{DIFFICULTY_LABELS[t.difficulty]}</Badge>
                    {t.is_premium && <PremiumBadge locked={locked} />}
                  </p>
                </div>
                <ButtonLink href={locked ? "/pricing" : `/mock-tests/${t.slug}`} size="sm" variant={locked ? "outline" : "secondary"}>{locked ? "Unlock" : "Start"}</ButtonLink>
              </li>
            );
          })}
        </ul>
      )}
    </SectionCard>
  );
}

export function RecentTests({ attempts }: { attempts: TestAttempt[] }) {
  return (
    <SectionCard title="Recent tests" icon={TrendingUp} href="/tests/history" hrefLabel="Full history">
      {attempts.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No tests yet" description="Attempt your first mock test to see results and analytics here." action={<ButtonLink href="/mock-tests" size="sm">Take a mock test</ButtonLink>} className="py-8" />
      ) : (
        <ul className="divide-y divide-ink-100">
          {attempts.map((a) => {
            const p = Number(a.percentage);
            return (
              <li key={a.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                <div className={cn("flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl text-xs font-bold", p >= 60 ? "bg-forest-50 text-forest-700" : p >= 40 ? "bg-saffron-50 text-saffron-800" : "bg-red-50 text-red-700")}>
                  {Math.round(p)}%
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink-900">{a.title}</p>
                  <p className="text-xs text-ink-500">{formatDate(a.submitted_at)} · {a.score}/{a.total_marks} marks · {a.accuracy}% accuracy</p>
                </div>
                <Link href={`/tests/result/${a.id}`} className="shrink-0 text-xs font-semibold text-brand-700 hover:underline">Review</Link>
              </li>
            );
          })}
        </ul>
      )}
    </SectionCard>
  );
}

export function SavedMaterials({ items, questionCount, testCount }: { items: { kind: "book" | "note"; material: { id: string; title: string; slug: string; cover_color: string } }[]; questionCount: number; testCount: number }) {
  return (
    <SectionCard title="Saved books & notes" icon={Bookmark} href="/bookmarks" hrefLabel="My bookmarks">
      {items.length === 0 ? (
        <p className="text-sm text-ink-500">Tap the bookmark icon on any book or note to save it here.</p>
      ) : (
        <ul className="grid gap-2">
          {items.map(({ kind, material }) => (
            <li key={`${kind}-${material.id}`} className="flex items-center gap-3">
              <span className="h-8 w-6 shrink-0 rounded-sm" style={{ background: material.cover_color }} aria-hidden="true" />
              <Link href={`/${kind === "book" ? "books" : "notes"}/${material.slug}`} className="min-w-0 flex-1 truncate text-sm font-medium text-ink-900 hover:text-brand-700">{material.title}</Link>
              <Badge>{kind === "book" ? "Book" : "Note"}</Badge>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-4 grid grid-cols-2 gap-2 border-t border-ink-100 pt-4 text-sm">
        <Link href="/bookmarks?type=question" className="flex items-center gap-2 rounded-lg bg-ink-50 px-3 py-2 text-ink-700 hover:bg-ink-100">
          <HelpCircle className="h-4 w-4 text-brand-700" aria-hidden="true" /> <span className="font-semibold">{questionCount}</span> questions
        </Link>
        <Link href="/bookmarks?type=mock_test" className="flex items-center gap-2 rounded-lg bg-ink-50 px-3 py-2 text-ink-700 hover:bg-ink-100">
          <ClipboardList className="h-4 w-4 text-brand-700" aria-hidden="true" /> <span className="font-semibold">{testCount}</span> tests
        </Link>
      </div>
    </SectionCard>
  );
}

export function WeakSubjects({ weak, strong }: { weak: SubjectStat[]; strong: SubjectStat[] }) {
  return (
    <SectionCard title="Weak & strong subjects" icon={Target} href="/analytics" hrefLabel="Analytics">
      {weak.length === 0 && strong.length === 0 ? (
        <p className="text-sm text-ink-500">Attempt a few tests and we&apos;ll highlight where to focus.</p>
      ) : (
        <div className="grid gap-4">
          {weak.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-red-700">Needs work</p>
              <ul className="grid gap-2">
                {weak.map((s) => (
                  <li key={s.subject.id} className="flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-ink-900">{s.subject.name}</span>
                        <span className="text-ink-500">{s.accuracy}%</span>
                      </div>
                      <Progress value={s.accuracy} tone="saffron" className="mt-1 h-1.5" label={`${s.subject.name} accuracy`} />
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Link href={`/notes?subject=${s.subject.slug}`} className="rounded-md bg-ink-100 px-2 py-1 text-[11px] font-semibold text-ink-700 hover:bg-ink-200">Notes</Link>
                      <Link href={`/mock-tests?subject=${s.subject.slug}`} className="rounded-md bg-brand-50 px-2 py-1 text-[11px] font-semibold text-brand-800 hover:bg-brand-100">Practice</Link>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {strong.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-forest-700">Strong</p>
              <ul className="flex flex-wrap gap-2">
                {strong.map((s) => <li key={s.subject.id}><Badge tone="forest">{s.subject.name} · {s.accuracy}%</Badge></li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </SectionCard>
  );
}

export function StudyStreak({ days, weekly }: { days: number; weekly: { label: string; value: number }[] }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 pt-5">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-saffron-50 text-saffron-700"><Flame className="h-6 w-6" aria-hidden="true" /></span>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-ink-500">Study streak</p>
          <p className="text-xl font-bold text-ink-900">{days} {days === 1 ? "day" : "days"}</p>
        </div>
        <ul className="flex gap-1" aria-label="Last 7 days activity">
          {weekly.map((d, i) => (
            <li key={i} className="flex flex-col items-center gap-1">
              <span className={cn("h-6 w-3 rounded-full", d.value > 0 ? "bg-forest-500" : "bg-ink-100")} title={`${d.label}: ${d.value}`} />
              <span className="text-[9px] text-ink-500">{d.label[0]}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
