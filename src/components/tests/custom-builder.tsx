"use client";

import { useActionState, useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Select } from "@/components/ui/form";
import { Alert } from "@/components/ui/misc";
import { startCustomTest, type CustomTestState } from "./actions";
import { cn } from "@/lib/utils";

type Counts = Record<string, Record<string, number>>;
const SIZES = [10, 20, 30, 50];

export function CustomTestBuilder({ exams, subjects, defaultExamId }: {
  exams: { id: string; name: string }[]; subjects: { id: string; name: string }[]; defaultExamId: string;
}) {
  const [state, action, pending] = useActionState<CustomTestState | null, FormData>(startCustomTest, null);
  const [exam, setExam] = useState(defaultExamId);
  const [subject, setSubject] = useState("");
  const [difficulty, setDifficulty] = useState("mixed");
  const [chosenCount, setCount] = useState(20);
  const [countsByExam, setCountsByExam] = useState<Record<string, Counts>>({});

  useEffect(() => {
    if (countsByExam[exam]) return;
    let alive = true;
    fetch(`/api/tests/pool?exam=${encodeURIComponent(exam)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d: Counts | null) => { if (alive && d) setCountsByExam((prev) => ({ ...prev, [exam]: d })); })
      .catch(() => undefined);
    return () => { alive = false; };
  }, [exam, countsByExam]);

  const counts: Counts | null = countsByExam[exam] ?? null;
  const available = counts ? (counts[subject || "all"]?.[difficulty] ?? 0) : null;
  // Derived: shrink the selection to the largest size the bank can serve.
  const count = available !== null && chosenCount > available
    ? ([...SIZES].reverse().find((s) => s <= available) ?? chosenCount)
    : chosenCount;

  return (
    <form action={action} className="grid gap-5">
      {state?.error && <Alert tone="error">{state.error}</Alert>}
      <Field label="Exam" htmlFor="exam_id">
        <Select id="exam_id" name="exam_id" value={exam} onChange={(e) => setExam(e.target.value)} required>
          {exams.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
        </Select>
      </Field>
      <Field label="Subject" htmlFor="subject_id" hint="Choose “All subjects” for a mixed, exam-style paper.">
        <Select id="subject_id" name="subject_id" value={subject} onChange={(e) => setSubject(e.target.value)}>
          <option value="">All subjects</option>
          {subjects.map((s) => {
            const n = counts?.[s.id]?.mixed ?? 0;
            return <option key={s.id} value={s.id} disabled={counts !== null && n < 5}>{s.name}{counts ? ` (${n})` : ""}</option>;
          })}
        </Select>
      </Field>
      <fieldset>
        <legend className="mb-1.5 block text-sm font-medium text-ink-700">Difficulty</legend>
        <div className="grid grid-cols-4 gap-2">
          {["easy", "medium", "hard", "mixed"].map((d) => (
            <label key={d} className={cn("flex cursor-pointer items-center justify-center rounded-xl border px-3 py-2.5 text-sm font-medium capitalize", difficulty === d ? "border-brand-600 bg-brand-50 text-brand-800" : "border-ink-200 text-ink-700 hover:bg-ink-50")}>
              <input type="radio" name="difficulty" value={d} checked={difficulty === d} onChange={() => setDifficulty(d)} className="sr-only" />
              {d}
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="mb-1.5 block text-sm font-medium text-ink-700">Number of questions</legend>
        <div className="grid grid-cols-4 gap-2">
          {SIZES.map((s) => {
            const disabled = available !== null && s > available;
            return (
              <label key={s} className={cn("flex cursor-pointer items-center justify-center rounded-xl border px-3 py-2.5 text-sm font-medium", disabled && "cursor-not-allowed opacity-40", count === s ? "border-brand-600 bg-brand-50 text-brand-800" : "border-ink-200 text-ink-700 hover:bg-ink-50")}>
                <input type="radio" name="question_count" value={s} checked={count === s} disabled={disabled} onChange={() => setCount(s)} className="sr-only" />
                {s}
              </label>
            );
          })}
        </div>
        <p className="mt-1.5 text-xs text-ink-500" aria-live="polite">
          {available === null ? "Checking question bank…" : `${available} questions available for this selection · ${Math.ceil(count * 1.2)} minutes`}
        </p>
      </fieldset>
      <Button type="submit" size="lg" variant="forest" loading={pending} disabled={available !== null && available < 5}>
        <Sparkles className="h-4 w-4" aria-hidden="true" /> Generate &amp; start test
      </Button>
    </form>
  );
}
