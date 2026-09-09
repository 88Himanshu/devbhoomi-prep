import Link from "next/link";
import { Calendar, Clock, Download, Eye, FileText, ListChecks, PlayCircle } from "lucide-react";
import type { Exam, MockTest, PreviousYearPaper, Subject } from "@/lib/types";
import type { AccessState } from "@/lib/types";
import { Badge, FreeBadge, PremiumBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { fileUrl } from "@/lib/storage";
import { LANGUAGE_LABELS, PAPER_TYPE_LABELS } from "@/lib/utils";

export function PaperCard({ paper, exam, subject, mockTest, access, user }: {
  paper: PreviousYearPaper; exam?: Exam; subject?: Subject; mockTest?: MockTest | null; access: AccessState; user: boolean;
}) {
  const locked = paper.is_premium && !access.canAccess("papers");
  const canOpen = access.isAdmin || (paper.is_premium ? !locked : user);
  const viewUrl = paper.file_path ? fileUrl(paper.file_path) : null;
  const loginNext = `/login?next=${encodeURIComponent("/previous-year-papers")}`;
  return (
    <Card hover className="flex h-full flex-col p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            {paper.is_premium ? <PremiumBadge locked={locked} /> : <FreeBadge />}
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
        {canOpen && viewUrl ? (
          <>
            <ButtonLink href={viewUrl} variant="outline" size="sm" target="_blank" rel="noopener"><Eye className="h-4 w-4" />View Paper</ButtonLink>
            <ButtonLink href={fileUrl(paper.file_path!, { download: true })} variant="outline" size="sm"><Download className="h-4 w-4" />Download</ButtonLink>
          </>
        ) : !user ? (
          <ButtonLink href={loginNext} variant="outline" size="sm"><FileText className="h-4 w-4" />{paper.is_premium ? "Log in to view" : "Log in to view free"}</ButtonLink>
        ) : (
          <ButtonLink href="/pricing" variant="saffron" size="sm">Upgrade to view</ButtonLink>
        )}
        {mockTest && (
          <ButtonLink href={`/mock-tests/${mockTest.slug}`} variant="forest" size="sm"><PlayCircle className="h-4 w-4" />Attempt as Mock Test</ButtonLink>
        )}
      </div>
    </Card>
  );
}
