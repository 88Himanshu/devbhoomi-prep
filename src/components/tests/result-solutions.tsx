"use client";

import { useState } from "react";
import { Check, Clock, Flag, X } from "lucide-react";
import type { OptionKey } from "@/lib/types";
import { Badge, difficultyTone } from "@/components/ui/badge";
import { BookmarkButton } from "@/components/bookmarks/bookmark-button";
import { cn, DIFFICULTY_LABELS, formatDuration } from "@/lib/utils";

export interface SolutionRow {
  id: string;
  index: number;
  text: string;
  options: { key: OptionKey; text: string }[];
  correct: OptionKey;
  selected: OptionKey | null;
  is_correct: boolean | null;
  marked: boolean;
  explanation: string;
  subject: string;
  difficulty: string;
  language: string;
  time_spent_seconds: number;
  bookmarked: boolean;
}

type Filter = "all" | "correct" | "incorrect" | "unattempted" | "marked";

export function ResultSolutions({ rows, showBookmarks }: { rows: SolutionRow[]; showBookmarks: boolean }) {
  const [filter, setFilter] = useState<Filter>("all");
  const counts = {
    all: rows.length,
    correct: rows.filter((r) => r.is_correct === true).length,
    incorrect: rows.filter((r) => r.is_correct === false).length,
    unattempted: rows.filter((r) => r.is_correct === null).length,
    marked: rows.filter((r) => r.marked).length,
  };
  const visible = rows.filter((r) =>
    filter === "all" ? true : filter === "correct" ? r.is_correct === true : filter === "incorrect" ? r.is_correct === false : filter === "unattempted" ? r.is_correct === null : r.marked,
  );
  const chips: { key: Filter; label: string }[] = [
    { key: "all", label: "All" }, { key: "correct", label: "Correct" }, { key: "incorrect", label: "Incorrect" }, { key: "unattempted", label: "Unattempted" }, { key: "marked", label: "Marked" },
  ];
  return (
    <div>
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter solutions">
        {chips.map((c) => (
          <button
            key={c.key}
            type="button"
            role="tab"
            aria-selected={filter === c.key}
            onClick={() => setFilter(c.key)}
            className={cn("rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors", filter === c.key ? "border-brand-700 bg-brand-700 text-white" : "border-ink-200 bg-white text-ink-700 hover:bg-ink-50")}
          >
            {c.label} <span className={cn("ml-1 text-xs", filter === c.key ? "text-brand-100" : "text-ink-500")}>{counts[c.key]}</span>
          </button>
        ))}
      </div>
      <ol className="mt-5 grid gap-4">
        {visible.length === 0 && <li className="rounded-card border border-dashed border-ink-200 p-8 text-center text-sm text-ink-500">Nothing in this filter.</li>}
        {visible.map((r) => (
          <li key={r.id} id={`q-${r.index}`} className="rounded-card border border-ink-200 bg-white p-5 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="rounded-lg bg-ink-100 px-2 py-0.5 text-xs font-semibold text-ink-900">Q{r.index}</span>
                <Badge tone="outline">{r.subject}</Badge>
                <Badge tone={difficultyTone(r.difficulty)}>{DIFFICULTY_LABELS[r.difficulty] ?? r.difficulty}</Badge>
                {r.is_correct === true && <Badge tone="forest"><Check className="h-3 w-3" aria-hidden="true" /> Correct</Badge>}
                {r.is_correct === false && <Badge tone="red"><X className="h-3 w-3" aria-hidden="true" /> Incorrect</Badge>}
                {r.is_correct === null && <Badge>Unattempted</Badge>}
                {r.marked && <Badge tone="saffron"><Flag className="h-3 w-3" aria-hidden="true" /> Marked</Badge>}
              </div>
              <div className="flex items-center gap-2 text-xs text-ink-500">
                <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" aria-hidden="true" /> {formatDuration(r.time_spent_seconds)}</span>
                {showBookmarks && <BookmarkButton type="question" itemId={r.id} initial={r.bookmarked} size="sm" />}
              </div>
            </div>
            <p className="mt-3 text-base text-ink-900" lang={r.language === "hi" ? "hi" : "en"}>{r.text}</p>
            <ul className="mt-3 grid gap-2">
              {r.options.map((o) => {
                const isCorrect = o.key === r.correct;
                const isPicked = o.key === r.selected;
                return (
                  <li
                    key={o.key}
                    className={cn(
                      "flex items-start gap-3 rounded-xl border px-3.5 py-2.5 text-sm",
                      isCorrect ? "border-forest-300 bg-forest-50 text-forest-900" : isPicked ? "border-red-300 bg-red-50 text-red-800" : "border-ink-200 text-ink-700",
                    )}
                  >
                    <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold", isCorrect ? "border-forest-600 bg-forest-600 text-white" : isPicked ? "border-red-500 bg-red-500 text-white" : "border-ink-300")}>{o.key}</span>
                    <span className="flex-1">{o.text}</span>
                    {isCorrect && <span className="text-xs font-semibold text-forest-700">Correct answer</span>}
                    {isPicked && !isCorrect && <span className="text-xs font-semibold text-red-700">Your answer</span>}
                  </li>
                );
              })}
            </ul>
            {r.explanation && (
              <div className="mt-3 rounded-xl bg-brand-50/70 px-4 py-3 text-sm text-ink-700">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-brand-700">Explanation</p>
                {r.explanation}
              </div>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
