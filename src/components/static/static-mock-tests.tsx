"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { ClipboardList, Sparkles } from "lucide-react";
import type { Exam, MockTest, Subject } from "@/lib/types";
import { EmptyState } from "@/components/ui/misc";
import { ButtonLink } from "@/components/ui/button";
import { MockTestCard } from "@/components/tests/mock-test-card";
import { MockTestFilters } from "@/components/tests/mock-test-filters";

interface Props { tests: MockTest[]; exams: Exam[]; subjects: Subject[] }

export function StaticMockTests(props: Props) {
  return (
    <Suspense fallback={null}>
      <Inner {...props} />
    </Suspense>
  );
}

function Inner({ tests, exams, subjects }: Props) {
  const sp = useSearchParams();
  const get = (k: string) => sp.get(k) ?? "";
  const q = get("q"), exam = get("exam"), subject = get("subject"), difficulty = get("difficulty"), accessFilter = get("access");
  const list = useMemo(() => {
    const term = q.toLowerCase();
    return tests
      .filter((t) =>
        (!exam || t.exam_id === exam) &&
        (!subject || (subject === "full" ? t.subject_id === null : t.subject_id === subject)) &&
        (!difficulty || t.difficulty === difficulty) &&
        (accessFilter !== "free" || !t.is_premium) && (accessFilter !== "premium" || t.is_premium) &&
        (!term || [t.title, t.description].some((s) => s.toLowerCase().includes(term))),
      )
      .sort((a, b) => b.attempts_count - a.attempts_count);
  }, [tests, q, exam, subject, difficulty, accessFilter]);
  const examMap = new Map(exams.map((e) => [e.id, e]));
  const subjectMap = new Map(subjects.map((s) => [s.id, s]));
  return (
    <>
      <div className="mt-6">
        <MockTestFilters exams={exams.map((e) => ({ id: e.id, name: e.short_name }))} subjects={subjects.map((s) => ({ id: s.id, name: s.name }))} />
      </div>
      <p className="mt-5 text-sm text-ink-500">{list.length} {list.length === 1 ? "test" : "tests"}{q ? ` matching “${q}”` : ""}</p>
      {list.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No tests match these filters" description="Try another exam or subject." className="mt-4" action={<ButtonLink href="/mock-tests" variant="outline" size="sm">Clear filters</ButtonLink>} />
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col justify-between rounded-card border border-dashed border-forest-300 bg-forest-50/60 p-5">
            <div>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-forest-700 shadow-card"><Sparkles className="h-5 w-5" aria-hidden="true" /></span>
              <h3 className="mt-3 text-base font-semibold text-ink-900">Build a custom test</h3>
              <p className="mt-1 text-sm text-ink-700">Pick an exam, subject, difficulty and number of questions. The full platform assembles a fresh test from the question bank every time.</p>
            </div>
            <ButtonLink href="/tests/new" variant="forest" size="sm" className="mt-4">Create test</ButtonLink>
          </div>
          {list.map((t) => (
            <MockTestCard key={t.id} test={t} exam={examMap.get(t.exam_id)} subject={t.subject_id ? subjectMap.get(t.subject_id) : null} locked={t.is_premium} />
          ))}
        </div>
      )}
    </>
  );
}
