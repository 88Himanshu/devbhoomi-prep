import Link from "next/link";
import { BookOpen, ClipboardList, Clock, Download, FileText, HelpCircle } from "lucide-react";
import type { Material, MockTest, PreviousYearPaper, Subject, Exam } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Badge, FreeBadge, PremiumBadge, difficultyTone } from "@/components/ui/badge";
import { LANGUAGE_LABELS, PAPER_TYPE_LABELS, formatNumber, DIFFICULTY_LABELS } from "@/lib/utils";

/** Lightweight catalogue cards used on the landing page and exam pages. */

export function MaterialCard({ item, subject, locked }: { item: Material; subject?: Subject; locked: boolean }) {
  const href = `/${item.kind === "book" ? "books" : "notes"}/${item.slug}`;
  return (
    <Link href={href} className="group block h-full">
      <Card hover className="flex h-full gap-4 p-4">
        <div
          className="flex h-24 w-[4.5rem] shrink-0 flex-col justify-between rounded-lg p-2 text-white shadow-inner"
          style={{ background: `linear-gradient(160deg, ${item.cover_color}, ${item.cover_color}cc)` }}
          aria-hidden="true"
        >
          <BookOpen className="h-4 w-4 opacity-80" />
          <span className="text-[10px] font-semibold uppercase tracking-wide opacity-90">{item.kind}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 text-sm font-semibold text-ink-900 group-hover:text-brand-800">{item.title}</h3>
            {item.is_premium ? <PremiumBadge locked={locked} className="shrink-0" /> : <FreeBadge className="shrink-0" />}
          </div>
          <p className="mt-1 text-xs text-ink-500">
            {subject?.name ?? "General"} · {LANGUAGE_LABELS[item.language]} · {item.pages} pages
          </p>
          <p className="mt-1.5 line-clamp-2 text-xs text-ink-500">{item.description}</p>
          <p className="mt-2 flex items-center gap-1 text-[11px] text-ink-500">
            <Download className="h-3 w-3" aria-hidden="true" /> {formatNumber(item.downloads)} downloads
          </p>
        </div>
      </Card>
    </Link>
  );
}

export function PaperCard({ paper, exam, locked }: { paper: PreviousYearPaper; exam?: Exam; locked: boolean }) {
  return (
    <Card hover className="flex h-full flex-col p-5">
      <div className="flex items-start justify-between gap-2">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest-50 text-forest-700">
          <FileText className="h-5 w-5" aria-hidden="true" />
        </span>
        {paper.is_premium ? <PremiumBadge locked={locked} /> : <FreeBadge />}
      </div>
      <h3 className="mt-3 text-sm font-semibold text-ink-900">{paper.title}</h3>
      <p className="mt-1 text-xs text-ink-500">
        {exam?.short_name ?? "Exam"} · {paper.year} · {PAPER_TYPE_LABELS[paper.paper_type]} · {paper.total_questions} questions
      </p>
      <div className="mt-auto flex flex-wrap gap-2 pt-4">
        <Link href={`/previous-year-papers?exam=${paper.exam_id}&year=${paper.year}`} className="text-xs font-semibold text-brand-700 hover:underline">
          View paper
        </Link>
        {paper.mock_test_id && (
          <span className="text-xs text-ink-500">· Attempt as mock test</span>
        )}
      </div>
    </Card>
  );
}

export function MockTestCard({ test, exam, subject, locked }: { test: MockTest; exam?: Exam; subject?: Subject; locked: boolean }) {
  return (
    <Link href={`/mock-tests/${test.slug}`} className="group block h-full">
      <Card hover className="flex h-full flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
            <ClipboardList className="h-5 w-5" aria-hidden="true" />
          </span>
          {test.is_premium ? <PremiumBadge locked={locked} /> : <FreeBadge />}
        </div>
        <h3 className="mt-3 text-sm font-semibold text-ink-900 group-hover:text-brand-800">{test.title}</h3>
        <p className="mt-1 text-xs text-ink-500">
          {exam?.short_name ?? "Exam"} · {subject?.name ?? "Full length"}
        </p>
        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-4 text-xs text-ink-500">
          <span className="flex items-center gap-1"><HelpCircle className="h-3.5 w-3.5" aria-hidden="true" /> {test.question_count} Qs</span>
          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" aria-hidden="true" /> {test.duration_minutes} min</span>
          <Badge tone={difficultyTone(test.difficulty)}>{DIFFICULTY_LABELS[test.difficulty]}</Badge>
          <span className="ml-auto">{formatNumber(test.attempts_count)} attempts</span>
        </div>
      </Card>
    </Link>
  );
}
