import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, ClipboardList, FileQuestion, FileText, Landmark, NotebookPen, SearchX } from "lucide-react";
import { getSessionUser } from "@/lib/auth/session";
import { getAccess } from "@/lib/access";
import { getExamMap, getSubjectMap } from "@/lib/services/catalog";
import { searchAll, totalResults, type SearchGroup } from "@/lib/services/search";
import { cn, LANGUAGE_LABELS, PAPER_TYPE_LABELS } from "@/lib/utils";
import { Badge, FreeBadge, PremiumBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Container, EmptyState, PageHeader } from "@/components/ui/misc";
import { SearchBox } from "@/components/search/search-box";
import { QuestionResult } from "@/components/search/question-result";

export const metadata: Metadata = { title: "Search", robots: { index: false } };

const TYPES: { key: "all" | SearchGroup; label: string; icon: typeof Landmark }[] = [
  { key: "all", label: "All", icon: Landmark },
  { key: "exams", label: "Exams", icon: Landmark },
  { key: "books", label: "Books", icon: BookOpen },
  { key: "notes", label: "Notes", icon: NotebookPen },
  { key: "papers", label: "Papers", icon: FileText },
  { key: "mockTests", label: "Mock Tests", icon: ClipboardList },
  { key: "questions", label: "Questions", icon: FileQuestion },
];

export default async function Page(props: PageProps<"/search">) {
  const sp = await props.searchParams;
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q)?.trim() ?? "";
  const typeRaw = Array.isArray(sp.type) ? sp.type[0] : sp.type;
  const type = (TYPES.some((t) => t.key === typeRaw) ? typeRaw : "all") as "all" | SearchGroup;

  const [user, access, examMap, subjectMap] = await Promise.all([getSessionUser(), getAccess(), getExamMap(), getSubjectMap()]);
  const results = await searchAll(q, { limit: type === "all" ? 6 : 40, groups: type === "all" ? undefined : [type] });
  const total = totalResults(results);
  const canSeeAnswers = access.isAdmin || access.canAccess("solutions");
  const href = (t: string) => `/search?q=${encodeURIComponent(q)}${t !== "all" ? `&type=${t}` : ""}`;

  return (
    <Container className="max-w-5xl py-8 sm:py-10">
      <PageHeader eyebrow="Global search" title={q ? `Results for “${q}”` : "Search"} description="Find exams, books, notes, previous-year papers, mock tests and questions." />
      <div className="mt-6"><SearchBox size="lg" defaultValue={q} autoFocus={!q} /></div>

      {q.length >= 2 && (
        <div className="mt-5 flex flex-wrap gap-1.5" role="tablist" aria-label="Result type">
          {TYPES.map((t) => (
            <Link key={t.key} href={href(t.key)} role="tab" aria-selected={type === t.key} className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium", type === t.key ? "border-brand-700 bg-brand-700 text-white" : "border-ink-200 text-ink-700 hover:border-brand-300")}>
              <t.icon className="h-3.5 w-3.5" aria-hidden="true" />{t.label}
            </Link>
          ))}
        </div>
      )}

      {q.length < 2 ? (
        <p className="mt-8 text-sm text-ink-500">Type at least 2 characters. Try “Uttarakhand GK”, “Patwari” or “Chipko”.</p>
      ) : total === 0 ? (
        <EmptyState className="mt-8" icon={SearchX} title="Nothing found" description="Check the spelling or try a broader term like the exam name or subject." />
      ) : (
        <div className="mt-8 space-y-10">
          <p className="text-sm text-ink-500"><span className="font-semibold text-ink-900">{total}</span> {total === 1 ? "result" : "results"}</p>

          {results.exams.length > 0 && (
            <Group title="Exams" more={type === "all" && results.exams.length >= 6 ? href("exams") : undefined}>
              <div className="grid gap-3 sm:grid-cols-2">
                {results.exams.map((e) => (
                  <Link key={e.id} href={`/exams/${e.slug}`} className="block">
                    <Card hover className="p-4"><p className="text-sm font-semibold text-ink-900">{e.name}</p><p className="mt-1 text-xs text-ink-500">{e.conducting_body} · {e.category}</p><p className="mt-2 line-clamp-2 text-xs text-ink-700">{e.tagline}</p></Card>
                  </Link>
                ))}
              </div>
            </Group>
          )}

          {(["books", "notes"] as const).map((k) => results[k].length > 0 && (
            <Group key={k} title={k === "books" ? "Books" : "Notes"} more={type === "all" && results[k].length >= 6 ? href(k) : undefined}>
              <div className="grid gap-3 sm:grid-cols-2">
                {results[k].map((m) => {
                  const locked = m.is_premium && !access.canAccess(k);
                  return (
                    <Link key={m.id} href={`/${k}/${m.slug}`} className="block">
                      <Card hover className="flex gap-3 p-4">
                        <span className="h-14 w-10 shrink-0 rounded-md" style={{ background: m.cover_color }} aria-hidden="true" />
                        <div className="min-w-0">
                          <div className="flex flex-wrap gap-1">{m.is_premium ? <PremiumBadge locked={locked} /> : <FreeBadge />}<Badge tone="brand">{subjectMap.get(m.subject_id)?.name}</Badge></div>
                          <p className="mt-1 line-clamp-2 text-sm font-semibold text-ink-900">{m.title}</p>
                          <p className="text-xs text-ink-500">{m.author} · {LANGUAGE_LABELS[m.language]} · {m.pages} pages</p>
                        </div>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </Group>
          ))}

          {results.papers.length > 0 && (
            <Group title="Previous Year Papers" more={type === "all" && results.papers.length >= 6 ? href("papers") : undefined}>
              <div className="grid gap-3 sm:grid-cols-2">
                {results.papers.map((p) => (
                  <Link key={p.id} href={`/previous-year-papers?exam=${p.exam_id}&year=${p.year}`} className="block">
                    <Card hover className="p-4">
                      <div className="flex flex-wrap gap-1">{p.is_premium ? <PremiumBadge locked={!access.canAccess("papers")} /> : <FreeBadge />}<Badge tone="brand">{PAPER_TYPE_LABELS[p.paper_type]}</Badge><Badge>{p.year}</Badge></div>
                      <p className="mt-1 text-sm font-semibold text-ink-900">{p.title}</p>
                      <p className="text-xs text-ink-500">{examMap.get(p.exam_id)?.short_name} · {p.total_questions} questions</p>
                    </Card>
                  </Link>
                ))}
              </div>
            </Group>
          )}

          {results.mockTests.length > 0 && (
            <Group title="Mock Tests" more={type === "all" && results.mockTests.length >= 6 ? href("mockTests") : undefined}>
              <div className="grid gap-3 sm:grid-cols-2">
                {results.mockTests.map((m) => (
                  <Link key={m.id} href={`/mock-tests/${m.slug}`} className="block">
                    <Card hover className="p-4">
                      <div className="flex flex-wrap gap-1">{m.is_premium ? <PremiumBadge locked={!access.canAccess("mock_tests")} /> : <FreeBadge />}<Badge tone="brand">{examMap.get(m.exam_id)?.short_name}</Badge></div>
                      <p className="mt-1 text-sm font-semibold text-ink-900">{m.title}</p>
                      <p className="text-xs text-ink-500">{m.question_count} questions · {m.duration_minutes} min · {m.difficulty}</p>
                    </Card>
                  </Link>
                ))}
              </div>
            </Group>
          )}

          {results.questions.length > 0 && (
            <Group title="Questions" more={type === "all" && results.questions.length >= 6 ? href("questions") : undefined}>
              <div className="space-y-3">
                {results.questions.map((qn) => (
                  <QuestionResult key={qn.id} question={qn} subject={subjectMap.get(qn.subject_id)?.name} exam={qn.exam_id ? examMap.get(qn.exam_id)?.short_name : undefined} canSeeAnswer={canSeeAnswers} signedIn={Boolean(user)} />
                ))}
              </div>
            </Group>
          )}
        </div>
      )}
    </Container>
  );
}

function Group({ title, more, children }: { title: string; more?: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-3 flex items-end justify-between">
        <h2 className="text-lg font-semibold text-ink-900">{title}</h2>
        {more && <Link href={more} className="text-sm font-medium text-brand-700 hover:underline">See all →</Link>}
      </div>
      {children}
    </section>
  );
}
