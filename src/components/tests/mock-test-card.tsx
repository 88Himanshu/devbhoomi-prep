import Link from "next/link";
import { Clock, FileQuestion, Lock, Play, Trophy, Users } from "lucide-react";
import type { Exam, MockTest, Subject, TestAttempt } from "@/lib/types";
import { Badge, PremiumBadge, FreeBadge, difficultyTone } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DIFFICULTY_LABELS, formatNumber } from "@/lib/utils";

export function MockTestCard({ test, exam, subject, locked, best }: {
  test: MockTest; exam?: Exam | null; subject?: Subject | null; locked: boolean; best?: TestAttempt | null;
}) {
  const href = `/mock-tests/${test.slug}`;
  return (
    <Card hover className="flex h-full flex-col">
      <div className="flex-1 p-5">
        <div className="mb-3 flex flex-wrap items-center gap-1.5">
          {test.is_premium ? <PremiumBadge locked={locked} /> : <FreeBadge />}
          {test.is_pyp && <Badge tone="brand">PYQ</Badge>}
          <Badge tone={difficultyTone(test.difficulty)}>{DIFFICULTY_LABELS[test.difficulty]}</Badge>
        </div>
        <h3 className="text-base font-semibold leading-snug text-ink-900">
          <Link href={href} className="hover:text-brand-700">{test.title}</Link>
        </h3>
        <p className="mt-1 text-xs text-ink-500">
          {exam?.short_name ?? "Uttarakhand exam"} · {subject ? subject.name : "Full length"}
        </p>
        <p className="mt-2 line-clamp-2 text-sm text-ink-500">{test.description}</p>
        <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs text-ink-700">
          <div className="flex items-center gap-1.5"><FileQuestion className="h-3.5 w-3.5 text-ink-500" aria-hidden="true" /> {test.question_count} questions</div>
          <div className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-ink-500" aria-hidden="true" /> {test.duration_minutes} min</div>
          <div className="flex items-center gap-1.5"><Trophy className="h-3.5 w-3.5 text-ink-500" aria-hidden="true" /> {test.total_marks} marks · −{test.negative_marks}</div>
          <div className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-ink-500" aria-hidden="true" /> {formatNumber(test.attempts_count)} attempts</div>
        </dl>
        {best && (
          <p className="mt-3 inline-flex items-center gap-1 rounded-lg bg-forest-50 px-2 py-1 text-xs font-medium text-forest-800">
            <Trophy className="h-3 w-3" aria-hidden="true" /> Your best: {best.percentage}%
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 border-t border-ink-100 px-5 py-3">
        <ButtonLink href={href} variant="outline" size="sm" className="flex-1">View</ButtonLink>
        <ButtonLink href={locked ? "/pricing" : `${href}?start=1`} variant={locked ? "saffron" : "primary"} size="sm" className="flex-1">
          {locked ? <><Lock className="h-3.5 w-3.5" aria-hidden="true" /> Unlock</> : <><Play className="h-3.5 w-3.5" aria-hidden="true" /> Start</>}
        </ButtonLink>
      </div>
    </Card>
  );
}
