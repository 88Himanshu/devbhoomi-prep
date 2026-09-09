"use client";

import { useState } from "react";
import Link from "next/link";
import { Lock } from "lucide-react";
import type { Question } from "@/lib/types";
import { Badge, difficultyTone } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn, DIFFICULTY_LABELS } from "@/lib/utils";
import { BookmarkButton } from "@/components/bookmarks/bookmark-button";

/** Question card with answer reveal (gated for premium solutions). */
export function QuestionResult({ question: q, subject, exam, canSeeAnswer, signedIn, bookmarked, showBookmark = true }: {
  question: Question; subject?: string; exam?: string; canSeeAnswer: boolean; signedIn: boolean; bookmarked?: boolean; showBookmark?: boolean;
}) {
  const [show, setShow] = useState(false);
  const options: { key: "A" | "B" | "C" | "D"; text: string }[] = [
    { key: "A", text: q.option_a }, { key: "B", text: q.option_b }, { key: "C", text: q.option_c }, { key: "D", text: q.option_d },
  ];
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {subject && <Badge tone="brand">{subject}</Badge>}
          {exam && <Badge>{exam}</Badge>}
          {q.year && <Badge tone="outline">{q.year}</Badge>}
          <Badge tone={difficultyTone(q.difficulty)}>{DIFFICULTY_LABELS[q.difficulty]}</Badge>
        </div>
        {showBookmark && <BookmarkButton type="question" itemId={q.id} initial={bookmarked} size="sm" />}
      </div>
      <p className={cn("mt-3 text-sm font-medium leading-relaxed text-ink-900", q.language === "hi" && "text-[15px]")}>{q.text}</p>
      <ol className="mt-3 grid gap-1.5 sm:grid-cols-2">
        {options.map((o) => (
          <li key={o.key} className={cn("flex gap-2 rounded-lg border px-3 py-2 text-sm", show && o.key === q.correct_option ? "border-forest-300 bg-forest-50 text-forest-900" : "border-ink-100 text-ink-700")}>
            <span className="font-semibold">{o.key}.</span><span>{o.text}</span>
          </li>
        ))}
      </ol>
      <div className="mt-3">
        {canSeeAnswer ? (
          <>
            <button type="button" onClick={() => setShow((v) => !v)} className="text-sm font-semibold text-brand-700 hover:underline" aria-expanded={show}>
              {show ? "Hide answer" : "Show answer & explanation"}
            </button>
            {show && (
              <div className="mt-2 rounded-lg bg-ink-50 p-3 text-sm text-ink-700">
                <p className="font-semibold text-ink-900">Correct answer: {q.correct_option}</p>
                <p className="mt-1">{q.explanation}</p>
              </div>
            )}
          </>
        ) : (
          <p className="flex items-center gap-1.5 text-xs text-ink-500">
            <Lock className="h-3.5 w-3.5" aria-hidden="true" />
            {signedIn ? <>Detailed solutions are a premium feature. <Link href="/pricing" className="font-semibold text-brand-700 underline">Upgrade</Link></> : <><Link href="/signup" className="font-semibold text-brand-700 underline">Sign up free</Link> to see answers and explanations.</>}
          </p>
        )}
      </div>
    </Card>
  );
}
