"use client";

import { Suspense, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BookOpen, ClipboardList, FileQuestion, FileText, Landmark, Lock, NotebookPen, SearchX } from "lucide-react";
import { Badge, FreeBadge, PremiumBadge, difficultyTone } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/misc";
import { SearchBox } from "@/components/search/search-box";
import { cn, DIFFICULTY_LABELS, LANGUAGE_LABELS, PAPER_TYPE_LABELS } from "@/lib/utils";

/* Compact, answer-free datasets embedded at build time. */
export interface SearchData {
  exams: { id: string; slug: string; name: string; short_name: string; conducting_body: string; category: string; tagline: string }[];
  books: SearchMaterial[];
  notes: SearchMaterial[];
  papers: { id: string; title: string; exam_id: string; year: number; paper_type: string; total_questions: number; is_premium: boolean }[];
  mockTests: { id: string; slug: string; title: string; description: string; exam_id: string; question_count: number; duration_minutes: number; difficulty: string; is_premium: boolean }[];
  questions: { id: string; text: string; option_a: string; option_b: string; option_c: string; option_d: string; subject_id: string; exam_id: string | null; year: number | null; difficulty: string; language: string }[];
  subjectNames: Record<string, string>;
  examNames: Record<string, string>;
}
export interface SearchMaterial { id: string; slug: string; title: string; description: string; author: string; subject_id: string; language: string; pages: number; is_premium: boolean; cover_color: string }

type GroupKey = "exams" | "books" | "notes" | "papers" | "mockTests" | "questions";
const TYPES: { key: "all" | GroupKey; label: string; icon: typeof Landmark }[] = [
  { key: "all", label: "All", icon: Landmark },
  { key: "exams", label: "Exams", icon: Landmark },
  { key: "books", label: "Books", icon: BookOpen },
  { key: "notes", label: "Notes", icon: NotebookPen },
  { key: "papers", label: "Papers", icon: FileText },
  { key: "mockTests", label: "Mock Tests", icon: ClipboardList },
  { key: "questions", label: "Questions", icon: FileQuestion },
];

export function StaticSearch({ data }: { data: SearchData }) {
  return (
    <Suspense fallback={null}>
      <Inner data={data} />
    </Suspense>
  );
}

const hit = (term: string, ...fields: (string | null | undefined)[]) => fields.some((f) => f?.toLowerCase().includes(term));

function Inner({ data }: { data: SearchData }) {
  const sp = useSearchParams();
  const q = (sp.get("q") ?? "").trim();
  const typeRaw = sp.get("type");
  const type = (TYPES.some((t) => t.key === typeRaw) ? typeRaw : "all") as "all" | GroupKey;
  const limit = type === "all" ? 6 : 40;
  const href = (t: string) => `/search?q=${encodeURIComponent(q)}${t !== "all" ? `&type=${t}` : ""}`;

  const results = useMemo(() => {
    const term = q.toLowerCase();
    if (term.length < 2) return null;
    const want = (k: GroupKey) => type === "all" || type === k;
    return {
      exams: want("exams") ? data.exams.filter((e) => hit(term, e.name, e.short_name, e.tagline, e.conducting_body)).slice(0, limit) : [],
      books: want("books") ? data.books.filter((m) => hit(term, m.title, m.description, m.author)).slice(0, limit) : [],
      notes: want("notes") ? data.notes.filter((m) => hit(term, m.title, m.description, m.author)).slice(0, limit) : [],
      papers: want("papers") ? data.papers.filter((p) => hit(term, p.title)).slice(0, limit) : [],
      mockTests: want("mockTests") ? data.mockTests.filter((m) => hit(term, m.title, m.description)).slice(0, limit) : [],
      questions: want("questions") ? data.questions.filter((x) => hit(term, x.text)).slice(0, limit) : [],
    };
  }, [data, q, type, limit]);
  const total = results ? Object.values(results).reduce((n, arr) => n + arr.length, 0) : 0;

  return (
    <>
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
      {!results ? (
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
                {results[k].map((m) => (
                  <Link key={m.id} href={`/${k}/${m.slug}`} className="block">
                    <Card hover className="flex gap-3 p-4">
                      <span className="h-14 w-10 shrink-0 rounded-md" style={{ background: m.cover_color }} aria-hidden="true" />
                      <div className="min-w-0">
                        <div className="flex flex-wrap gap-1">{m.is_premium ? <PremiumBadge locked /> : <FreeBadge />}<Badge tone="brand">{data.subjectNames[m.subject_id]}</Badge></div>
                        <p className="mt-1 line-clamp-2 text-sm font-semibold text-ink-900">{m.title}</p>
                        <p className="text-xs text-ink-500">{m.author} · {LANGUAGE_LABELS[m.language]} · {m.pages} pages</p>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </Group>
          ))}
          {results.papers.length > 0 && (
            <Group title="Previous Year Papers" more={type === "all" && results.papers.length >= 6 ? href("papers") : undefined}>
              <div className="grid gap-3 sm:grid-cols-2">
                {results.papers.map((p) => (
                  <Link key={p.id} href={`/previous-year-papers?exam=${p.exam_id}&year=${p.year}`} className="block">
                    <Card hover className="p-4">
                      <div className="flex flex-wrap gap-1">{p.is_premium ? <PremiumBadge locked /> : <FreeBadge />}<Badge tone="brand">{PAPER_TYPE_LABELS[p.paper_type]}</Badge><Badge>{p.year}</Badge></div>
                      <p className="mt-1 text-sm font-semibold text-ink-900">{p.title}</p>
                      <p className="text-xs text-ink-500">{data.examNames[p.exam_id]} · {p.total_questions} questions</p>
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
                      <div className="flex flex-wrap gap-1">{m.is_premium ? <PremiumBadge locked /> : <FreeBadge />}<Badge tone="brand">{data.examNames[m.exam_id]}</Badge></div>
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
                {results.questions.map((x) => (
                  <Card key={x.id} className="p-4">
                    <div className="flex flex-wrap gap-1.5">
                      <Badge tone="brand">{data.subjectNames[x.subject_id]}</Badge>
                      {x.exam_id && <Badge>{data.examNames[x.exam_id]}</Badge>}
                      {x.year && <Badge tone="outline">{x.year}</Badge>}
                      <Badge tone={difficultyTone(x.difficulty)}>{DIFFICULTY_LABELS[x.difficulty]}</Badge>
                    </div>
                    <p className={cn("mt-3 text-sm font-medium leading-relaxed text-ink-900", x.language === "hi" && "text-[15px]")}>{x.text}</p>
                    <ol className="mt-3 grid gap-1.5 sm:grid-cols-2">
                      {[["A", x.option_a], ["B", x.option_b], ["C", x.option_c], ["D", x.option_d]].map(([k, t]) => (
                        <li key={k} className="flex gap-2 rounded-lg border border-ink-100 px-3 py-2 text-sm text-ink-700"><span className="font-semibold">{k}.</span><span>{t}</span></li>
                      ))}
                    </ol>
                    <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-500">
                      <Lock className="h-3.5 w-3.5" aria-hidden="true" /> Answers and explanations are shown to students on the full platform. <Link href="/signup" className="font-semibold text-brand-700 underline">Learn more</Link>
                    </p>
                  </Card>
                ))}
              </div>
            </Group>
          )}
        </div>
      )}
    </>
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
