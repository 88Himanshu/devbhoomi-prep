"use client";

import { Suspense, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Calendar, Clock, Download, Eye, FileText, ListChecks, PlayCircle } from "lucide-react";
import type { Exam, PreviousYearPaper, Subject } from "@/lib/types";
import { Badge, FreeBadge, PremiumBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/misc";
import { FilterBar } from "@/components/library/filter-bar";
import { cn, LANGUAGE_LABELS, PAPER_TYPE_LABELS } from "@/lib/utils";

export interface StaticPaper extends PreviousYearPaper { viewUrl: string | null; mockSlug: string | null }
interface Props { papers: StaticPaper[]; exams: Exam[]; subjects: Subject[]; years: number[] }

export function StaticPapers(props: Props) {
  return (
    <Suspense fallback={null}>
      <Inner {...props} />
    </Suspense>
  );
}

function Inner({ papers, exams, subjects, years }: Props) {
  const sp = useSearchParams();
  const get = (k: string) => sp.get(k) || undefined;
  const q = get("q"), examId = get("exam"), year = get("year"), subjectId = get("subject"), paperType = get("type");

  const list = useMemo(() => {
    const term = q?.toLowerCase();
    return papers.filter((p) =>
      (!examId || p.exam_id === examId) && (!year || p.year === Number(year)) && (!subjectId || p.subject_id === subjectId) &&
      (!paperType || p.paper_type === paperType) && (!term || p.title.toLowerCase().includes(term)),
    );
  }, [papers, q, examId, year, subjectId, paperType]);

  const subjectMap = new Map(subjects.map((s) => [s.id, s]));
  const yearHref = (y?: number) => {
    const p = new URLSearchParams();
    if (q) p.set("q", q); if (examId) p.set("exam", examId); if (subjectId) p.set("subject", subjectId); if (paperType) p.set("type", paperType);
    if (y) p.set("year", String(y));
    return `/previous-year-papers${p.toString() ? `?${p}` : ""}`;
  };
  const groups = exams.map((e) => ({ exam: e, papers: list.filter((p) => p.exam_id === e.id) })).filter((g) => g.papers.length);

  return (
    <>
      <div className="mt-6">
        <FilterBar
          key={sp.toString()}
          basePath="/previous-year-papers"
          q={q}
          placeholder="Search papers by title…"
          filters={[
            { name: "exam", label: "Exams", options: exams.map((e) => ({ value: e.id, label: e.short_name })), value: examId },
            { name: "year", label: "Years", options: years.map((y) => ({ value: String(y), label: String(y) })), value: year },
            { name: "subject", label: "Subjects", options: subjects.map((s) => ({ value: s.id, label: s.name })), value: subjectId },
            { name: "type", label: "Paper types", options: Object.entries(PAPER_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l })), value: paperType },
          ]}
        />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-1.5" aria-label="Filter by year">
        <Link href={yearHref()} className={cn("rounded-full border px-3 py-1 text-xs font-medium", !year ? "border-brand-700 bg-brand-700 text-white" : "border-ink-200 text-ink-700 hover:border-brand-300")}>All years</Link>
        {years.map((y) => (
          <Link key={y} href={yearHref(y)} className={cn("rounded-full border px-3 py-1 text-xs font-medium", year === String(y) ? "border-brand-700 bg-brand-700 text-white" : "border-ink-200 text-ink-700 hover:border-brand-300")}>{y}</Link>
        ))}
      </div>
      <p className="mt-5 text-sm text-ink-500"><span className="font-semibold text-ink-900">{list.length}</span> {list.length === 1 ? "paper" : "papers"}{q && <> for “{q}”</>}</p>
      {list.length === 0 ? (
        <EmptyState className="mt-6" icon={FileText} title="No papers match these filters" description="Try another exam or year." action={<ButtonLink href="/previous-year-papers" variant="outline" size="sm">Clear filters</ButtonLink>} />
      ) : (
        <div className="mt-4 space-y-10">
          {groups.map(({ exam, papers: items }) => (
            <section key={exam.id}>
              <div className="mb-3 flex items-end justify-between gap-3">
                <h2 className="text-lg font-semibold text-ink-900">{exam.name} <span className="text-sm font-normal text-ink-500">· {items.length}</span></h2>
                <Link href={`/exams/${exam.slug}`} className="text-sm font-medium text-brand-700 hover:underline">Exam page →</Link>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {items.map((p) => <StaticPaperCard key={p.id} paper={p} exam={exam} subject={p.subject_id ? subjectMap.get(p.subject_id) : undefined} />)}
              </div>
            </section>
          ))}
        </div>
      )}
      <p className="mt-10 rounded-xl bg-ink-50 px-4 py-3 text-center text-xs text-ink-500">
        Question papers are reproduced from publicly released examination material or reconstructed from memory-based sources for practice. Answer keys are prepared by the Devbhoomi Prep team.
      </p>
    </>
  );
}

function StaticPaperCard({ paper, exam, subject }: { paper: StaticPaper; exam?: Exam; subject?: Subject }) {
  return (
    <Card hover className="flex h-full flex-col p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            {paper.is_premium ? <PremiumBadge locked /> : <FreeBadge />}
            <Badge tone="brand">{PAPER_TYPE_LABELS[paper.paper_type]}</Badge>
            {subject && <Badge>{subject.name}</Badge>}
          </div>
          <h3 className="mt-2 text-sm font-semibold leading-snug text-ink-900">{paper.title}</h3>
          {exam && <Link href={`/exams/${exam.slug}`} className="mt-1 inline-block text-xs font-medium text-brand-700 hover:underline">{exam.name}</Link>}
        </div>
        <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-brand-50 text-brand-800">
          <Calendar className="h-4 w-4" aria-hidden="true" />
          <span className="text-sm font-bold leading-tight">{paper.year}</span>
        </div>
      </div>
      <dl className="mt-3 grid grid-cols-3 gap-2 text-[11px] text-ink-500">
        <div className="rounded-lg bg-ink-50 px-2 py-1.5"><dt className="flex items-center gap-1"><ListChecks className="h-3 w-3" aria-hidden="true" />Questions</dt><dd className="font-semibold text-ink-900">{paper.total_questions}</dd></div>
        <div className="rounded-lg bg-ink-50 px-2 py-1.5"><dt className="flex items-center gap-1"><Clock className="h-3 w-3" aria-hidden="true" />Duration</dt><dd className="font-semibold text-ink-900">{paper.duration_minutes ? `${paper.duration_minutes} min` : "—"}</dd></div>
        <div className="rounded-lg bg-ink-50 px-2 py-1.5"><dt>Language</dt><dd className="font-semibold text-ink-900">{LANGUAGE_LABELS[paper.language]}</dd></div>
      </dl>
      <div className="mt-4 flex flex-wrap gap-2">
        {!paper.is_premium && paper.viewUrl ? (
          <>
            <ButtonLink href={paper.viewUrl} variant="outline" size="sm" target="_blank" rel="noopener"><Eye className="h-4 w-4" />View Paper</ButtonLink>
            <ButtonLink href={paper.viewUrl} variant="outline" size="sm" download><Download className="h-4 w-4" />Download</ButtonLink>
          </>
        ) : (
          <ButtonLink href="/pricing" variant="saffron" size="sm">Premium · Upgrade to view</ButtonLink>
        )}
        {paper.mockSlug && (
          <ButtonLink href={`/mock-tests/${paper.mockSlug}`} variant="forest" size="sm"><PlayCircle className="h-4 w-4" />Attempt as Mock Test</ButtonLink>
        )}
      </div>
    </Card>
  );
}
