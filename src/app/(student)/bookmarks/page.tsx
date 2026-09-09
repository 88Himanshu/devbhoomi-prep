import type { Metadata } from "next";
import Link from "next/link";
import { Bookmark, BookOpen, ClipboardList, FileQuestion, NotebookPen } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { getAccess } from "@/lib/access";
import { db } from "@/lib/data";
import { getExamMap, getSubjectMap } from "@/lib/services/catalog";
import { listBookmarks } from "@/lib/services/bookmarks";
import { listProgress } from "@/lib/services/progress";
import type { Material, MockTest, Question } from "@/lib/types";
import { cn, DIFFICULTY_LABELS } from "@/lib/utils";
import { Badge, FreeBadge, PremiumBadge, difficultyTone } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState, PageHeader } from "@/components/ui/misc";
import { MaterialCard } from "@/components/library/material-card";
import { QuestionResult } from "@/components/search/question-result";
import { BookmarkButton } from "@/components/bookmarks/bookmark-button";

export const metadata: Metadata = { title: "My Bookmarks", robots: { index: false } };

const TABS = [
  { key: "book", label: "Books", icon: BookOpen },
  { key: "note", label: "Notes", icon: NotebookPen },
  { key: "question", label: "Questions", icon: FileQuestion },
  { key: "mock_test", label: "Mock Tests", icon: ClipboardList },
] as const;
type TabKey = (typeof TABS)[number]["key"];

export default async function Page(props: PageProps<"/bookmarks">) {
  const user = await requireUser("/bookmarks");
  const sp = await props.searchParams;
  const tabRaw = Array.isArray(sp.tab) ? sp.tab[0] : sp.tab;
  const tab: TabKey = TABS.some((t) => t.key === tabRaw) ? (tabRaw as TabKey) : "book";

  const [all, access, examMap, subjectMap] = await Promise.all([listBookmarks(user.id), getAccess(), getExamMap(), getSubjectMap()]);
  const counts = Object.fromEntries(TABS.map((t) => [t.key, all.filter((b) => b.item_type === t.key).length])) as Record<TabKey, number>;
  const ids = all.filter((b) => b.item_type === tab).map((b) => b.item_id);
  const store = await db();

  let materials: Material[] = [], questions: Question[] = [], tests: MockTest[] = [];
  if (ids.length) {
    if (tab === "book" || tab === "note") materials = await store.select(tab === "book" ? "books" : "notes", { in: { id: ids } });
    else if (tab === "question") questions = await store.select("questions", { in: { id: ids } });
    else tests = await store.select("mock_tests", { in: { id: ids } });
  }
  const order = new Map(ids.map((id, i) => [id, i]));
  const byOrder = <T extends { id: string }>(arr: T[]) => [...arr].sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
  const progress = tab === "book" || tab === "note" ? await listProgress(user.id, tab) : [];
  const progressMap = new Map(progress.map((p) => [p.item_id, p.progress_percent]));
  const canSeeAnswers = access.isAdmin || access.canAccess("solutions");

  return (
    <div>
      <PageHeader eyebrow="Saved for later" title="My Bookmarks" description="Books, notes, questions and mock tests you have saved." />
      <div className="mt-6 flex gap-1 overflow-x-auto rounded-xl bg-ink-100 p-1 scrollbar-thin" role="tablist">
        {TABS.map((t) => (
          <Link key={t.key} href={`/bookmarks?tab=${t.key}`} role="tab" aria-selected={tab === t.key} className={cn("inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium", tab === t.key ? "bg-white text-brand-800 shadow-card" : "text-ink-500 hover:text-ink-900")}>
            <t.icon className="h-4 w-4" aria-hidden="true" />{t.label}<span className={cn("rounded-full px-1.5 text-[11px]", tab === t.key ? "bg-brand-50 text-brand-700" : "bg-ink-200/70 text-ink-500")}>{counts[t.key]}</span>
          </Link>
        ))}
      </div>

      <div className="mt-6">
        {ids.length === 0 ? (
          <EmptyState icon={Bookmark} title={`No saved ${TABS.find((t) => t.key === tab)!.label.toLowerCase()} yet`} description="Tap the bookmark icon on any item to save it here." action={<ButtonLink href={tab === "book" ? "/books" : tab === "note" ? "/notes" : tab === "question" ? "/search?q=Uttarakhand&type=questions" : "/mock-tests"} variant="outline" size="sm">Browse {TABS.find((t) => t.key === tab)!.label}</ButtonLink>} />
        ) : tab === "book" || tab === "note" ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {byOrder(materials).map((m) => (
              <MaterialCard key={m.id} material={m} subject={subjectMap.get(m.subject_id)} exams={m.exam_ids.map((id) => examMap.get(id)).filter(Boolean) as NonNullable<ReturnType<typeof examMap.get>>[]} locked={m.is_premium && !access.canAccess(tab === "book" ? "books" : "notes")} bookmarked progress={progressMap.get(m.id) ?? null} />
            ))}
          </div>
        ) : tab === "question" ? (
          <div className="space-y-3">
            {byOrder(questions).map((q) => (
              <QuestionResult key={q.id} question={q} subject={subjectMap.get(q.subject_id)?.name} exam={q.exam_id ? examMap.get(q.exam_id)?.short_name : undefined} canSeeAnswer={canSeeAnswers} signedIn bookmarked />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {byOrder(tests).map((t) => {
              const locked = t.is_premium && !access.canAccess("mock_tests");
              return (
                <Card key={t.id} hover className="relative flex flex-col p-4">
                  <div className="flex flex-wrap gap-1.5 pr-10">
                    {t.is_premium ? <PremiumBadge locked={locked} /> : <FreeBadge />}
                    <Badge tone="brand">{examMap.get(t.exam_id)?.short_name}</Badge>
                    <Badge tone={difficultyTone(t.difficulty)}>{DIFFICULTY_LABELS[t.difficulty]}</Badge>
                  </div>
                  <h3 className="mt-2 text-sm font-semibold text-ink-900">{t.title}</h3>
                  <p className="mt-1 line-clamp-2 text-xs text-ink-700">{t.description}</p>
                  <p className="mt-2 text-xs text-ink-500">{t.question_count} questions · {t.duration_minutes} min · {t.total_marks} marks{t.subject_id ? ` · ${subjectMap.get(t.subject_id)?.name}` : ""}</p>
                  <div className="mt-4"><ButtonLink href={`/mock-tests/${t.slug}`} size="sm" variant={locked ? "outline" : "primary"}>{locked ? "View test" : "Start test"}</ButtonLink></div>
                  <div className="absolute right-3 top-3"><BookmarkButton type="mock_test" itemId={t.id} initial size="sm" /></div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
