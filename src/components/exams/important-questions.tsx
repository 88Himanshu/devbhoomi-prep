"use client";

import { useState } from "react";
import { CheckCircle2, ChevronDown } from "lucide-react";
import type { Question } from "@/lib/types";
import { Badge, difficultyTone } from "@/components/ui/badge";
import { DIFFICULTY_LABELS, cn } from "@/lib/utils";

const KEYS = ["A", "B", "C", "D"] as const;

export function ImportantQuestions({ questions, subjectNames }: { questions: Question[]; subjectNames: Record<string, string> }) {
  return (
    <ol className="space-y-4">
      {questions.map((q, i) => (
        <QuestionItem key={q.id} q={q} index={i + 1} subject={subjectNames[q.subject_id]} />
      ))}
    </ol>
  );
}

function QuestionItem({ q, index, subject }: { q: Question; index: number; subject?: string }) {
  const [open, setOpen] = useState(false);
  const options = [q.option_a, q.option_b, q.option_c, q.option_d];
  return (
    <li className="rounded-2xl border border-ink-200 bg-white p-5 shadow-card">
      <div className="flex flex-wrap items-center gap-2 text-xs text-ink-500">
        <span className="font-semibold text-ink-900">Q{index}</span>
        {subject && <Badge>{subject}</Badge>}
        <Badge tone={difficultyTone(q.difficulty)}>{DIFFICULTY_LABELS[q.difficulty]}</Badge>
        {q.year && <span>· {q.year}</span>}
      </div>
      <p className="mt-2 text-sm font-medium text-ink-900">{q.text}</p>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {options.map((opt, i) => {
          const key = KEYS[i];
          const correct = open && key === q.correct_option;
          return (
            <li key={key} className={cn("flex items-start gap-2 rounded-lg border px-3 py-2 text-sm", correct ? "border-forest-300 bg-forest-50 text-forest-900" : "border-ink-200 text-ink-700")}>
              <span className={cn("mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold", correct ? "bg-forest-600 text-white" : "bg-ink-100 text-ink-700")}>{key}</span>
              <span>{opt}</span>
              {correct && <CheckCircle2 className="ml-auto h-4 w-4 shrink-0 text-forest-600" aria-label="Correct answer" />}
            </li>
          );
        })}
      </ul>
      <button type="button" onClick={() => setOpen((v) => !v)} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-900" aria-expanded={open}>
        {open ? "Hide answer" : "Show answer"} <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} aria-hidden="true" />
      </button>
      {open && (
        <div className="mt-3 rounded-xl bg-ink-50 p-4 text-sm text-ink-700">
          <p className="font-semibold text-ink-900">Correct answer: {q.correct_option}</p>
          <p className="mt-1 leading-relaxed">{q.explanation}</p>
        </div>
      )}
    </li>
  );
}
