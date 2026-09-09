"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Check, ChevronLeft, ChevronRight, Flag, LayoutGrid, Loader2, TimerReset, X } from "lucide-react";
import type { OptionKey } from "@/lib/types";
import type { DeliveredQuestion } from "@/lib/services/tests";
import { LogoMark } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type AnswerState = { selected: OptionKey | null; marked: boolean };
type PaletteState = "answered" | "not-answered" | "marked" | "answered-marked" | "not-visited";

const OPTION_KEYS: OptionKey[] = ["A", "B", "C", "D"];

export function TestEngine({ attemptId, title, studentName, durationMinutes, remainingSeconds, questions, subjects, initialAnswers }: {
  attemptId: string;
  title: string;
  studentName: string;
  durationMinutes: number;
  remainingSeconds: number;
  questions: DeliveredQuestion[];
  subjects: Record<string, string>;
  initialAnswers: { question_id: string; selected_option: OptionKey | null; marked_for_review: boolean }[];
}) {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerState>>(() => {
    const map: Record<string, AnswerState> = {};
    for (const a of initialAnswers) map[a.question_id] = { selected: a.selected_option, marked: a.marked_for_review };
    return map;
  });
  const [visited, setVisited] = useState<Set<string>>(() => new Set(initialAnswers.map((a) => a.question_id)));
  const [remaining, setRemaining] = useState(remainingSeconds);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [timeoutNotice, setTimeoutNotice] = useState(false);
  const submittedRef = useRef(false);
  const questionStart = useRef<number>(0);
  const pendingSaves = useRef(0);
  const deadline = useRef<number>(0);

  const q = questions[current];
  const state = answers[q.id] ?? { selected: null, marked: false };

  /* ---------- persistence ---------- */
  const persist = useCallback(async (questionId: string, patch: { selected_option?: OptionKey | null; marked_for_review?: boolean; time_spent_seconds?: number }) => {
    pendingSaves.current += 1;
    setSaveState("saving");
    try {
      const res = await fetch(`/api/tests/${attemptId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question_id: questionId, ...patch }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 409 || data.finalized) {
        submittedRef.current = true;
        router.replace(`/tests/result/${attemptId}?timeout=1`);
        return;
      }
      if (!res.ok) throw new Error(data.error ?? "save failed");
      if (typeof data.remaining_seconds === "number") deadline.current = Date.now() + data.remaining_seconds * 1000;
      setSaveState("saved");
    } catch {
      setSaveState("error");
    } finally {
      pendingSaves.current -= 1;
    }
  }, [attemptId, router]);

  const elapsedOnCurrent = () => {
    const secs = Math.round((Date.now() - questionStart.current) / 1000);
    questionStart.current = Date.now();
    return Math.max(0, Math.min(secs, 3600));
  };

  const goTo = useCallback((idx: number) => {
    if (idx < 0 || idx >= questions.length) return;
    const from = questions[current];
    const spent = elapsedOnCurrent();
    if (spent > 0) void persist(from.id, { time_spent_seconds: spent });
    setCurrent(idx);
    setPaletteOpen(false);
    setVisited((v) => (v.has(questions[idx].id) ? v : new Set(v).add(questions[idx].id)));
  }, [current, questions, persist]);

  const select = (opt: OptionKey) => {
    setAnswers((a) => ({ ...a, [q.id]: { ...(a[q.id] ?? { marked: false }), selected: opt } }));
    setVisited((v) => new Set(v).add(q.id));
    void persist(q.id, { selected_option: opt });
  };

  const clear = () => {
    setAnswers((a) => ({ ...a, [q.id]: { ...(a[q.id] ?? { marked: false }), selected: null } }));
    void persist(q.id, { selected_option: null });
  };

  const toggleMark = (thenNext = false) => {
    const next = !state.marked;
    setAnswers((a) => ({ ...a, [q.id]: { ...(a[q.id] ?? { selected: null }), marked: next } }));
    setVisited((v) => new Set(v).add(q.id));
    void persist(q.id, { marked_for_review: next });
    if (thenNext) goTo(Math.min(current + 1, questions.length - 1));
  };

  const submit = useCallback(async (auto = false) => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitting(true);
    const spent = elapsedOnCurrent();
    if (spent > 0) await persist(questions[current].id, { time_spent_seconds: spent }).catch(() => undefined);
    // wait briefly for in-flight saves
    const started = Date.now();
    while (pendingSaves.current > 0 && Date.now() - started < 3000) await new Promise((r) => setTimeout(r, 100));
    try {
      const res = await fetch(`/api/tests/${attemptId}/submit`, { method: "POST" });
      if (!res.ok && res.status !== 409) throw new Error("submit failed");
      router.replace(`/tests/result/${attemptId}${auto ? "?timeout=1" : ""}`);
    } catch {
      submittedRef.current = false;
      setSubmitting(false);
      setSaveState("error");
    }
  }, [attemptId, current, persist, questions, router]);

  /* ---------- timer ---------- */
  useEffect(() => {
    if (deadline.current === 0) {
      deadline.current = Date.now() + remainingSeconds * 1000;
      questionStart.current = Date.now();
    }
    const tick = () => {
      const left = Math.max(0, Math.round((deadline.current - Date.now()) / 1000));
      setRemaining(left);
      if (left <= 0 && !submittedRef.current) {
        setTimeoutNotice(true);
        void submit(true);
      }
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [submit, remainingSeconds]);

  /* ---------- guard against leaving ---------- */
  useEffect(() => {
    const onUnload = (e: BeforeUnloadEvent) => {
      if (submittedRef.current) return;
      e.preventDefault();
    };
    window.addEventListener("beforeunload", onUnload);
    return () => window.removeEventListener("beforeunload", onUnload);
  }, []);

  /* ---------- keyboard shortcuts ---------- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (confirmOpen || (e.target as HTMLElement)?.tagName === "INPUT") return;
      if (["1", "2", "3", "4"].includes(e.key)) select(OPTION_KEYS[Number(e.key) - 1]);
      else if (e.key === "n" || e.key === "N" || e.key === "ArrowRight") goTo(current + 1);
      else if (e.key === "p" || e.key === "P" || e.key === "ArrowLeft") goTo(current - 1);
      else if (e.key === "m" || e.key === "M") toggleMark();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, confirmOpen, state.marked]);

  /* ---------- derived ---------- */
  const paletteState = (id: string): PaletteState => {
    const a = answers[id];
    if (!visited.has(id) && !a) return "not-visited";
    if (a?.selected && a.marked) return "answered-marked";
    if (a?.marked) return "marked";
    if (a?.selected) return "answered";
    return "not-answered";
  };
  const counts = useMemo(() => {
    const c = { answered: 0, "not-answered": 0, marked: 0, "answered-marked": 0, "not-visited": 0 };
    for (const qq of questions) c[paletteState(qq.id)] += 1;
    return c;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, visited, questions]);
  const attemptedCount = counts.answered + counts["answered-marked"];
  const warn = remaining <= 300;
  const timeLabel = `${String(Math.floor(remaining / 3600)).padStart(2, "0")}:${String(Math.floor((remaining % 3600) / 60)).padStart(2, "0")}:${String(remaining % 60).padStart(2, "0")}`;

  const options: { key: OptionKey; text: string }[] = [
    { key: "A", text: q.option_a }, { key: "B", text: q.option_b }, { key: "C", text: q.option_c }, { key: "D", text: q.option_d },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-ink-50">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-ink-200 bg-white">
        <div className="mx-auto flex h-14 max-w-screen-2xl items-center justify-between gap-3 px-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-2.5">
            <LogoMark className="h-8 w-8" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink-900">{title}</p>
              <p className="hidden truncate text-xs text-ink-500 sm:block">{studentName} · {questions.length} questions · {durationMinutes} min</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden text-xs text-ink-500 sm:inline" aria-live="polite">
              {saveState === "saving" && <span className="inline-flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" /> Saving…</span>}
              {saveState === "saved" && <span className="inline-flex items-center gap-1 text-forest-700"><Check className="h-3 w-3" aria-hidden="true" /> Saved</span>}
              {saveState === "error" && <span className="text-red-600">Not saved – check connection</span>}
            </span>
            <div className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-sm font-semibold tabular-nums", warn ? "bg-red-50 text-red-700" : "bg-brand-50 text-brand-800")} role="timer" aria-label="Time remaining">
              <TimerReset className="h-4 w-4" aria-hidden="true" /> {timeLabel}
            </div>
            <Button type="button" size="sm" variant="outline" className="lg:hidden" onClick={() => setPaletteOpen(true)} aria-label="Open question palette">
              <LayoutGrid className="h-4 w-4" /> <span className="hidden sm:inline">Palette</span>
            </Button>
            <Button type="button" size="sm" variant="forest" onClick={() => setConfirmOpen(true)} disabled={submitting}>Submit</Button>
          </div>
        </div>
        {warn && (
          <div className="bg-red-600 px-4 py-1 text-center text-xs font-medium text-white" role="alert">
            <AlertTriangle className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" /> Less than 5 minutes left. The test will submit automatically at 00:00:00.
          </div>
        )}
      </header>

      <div className="mx-auto flex w-full max-w-screen-2xl flex-1 gap-5 px-3 py-4 sm:px-5 lg:py-6">
        {/* Question panel */}
        <section className="flex min-w-0 flex-1 flex-col" aria-label={`Question ${current + 1}`}>
          <div className="flex flex-1 flex-col rounded-2xl border border-ink-200 bg-white shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink-100 px-4 py-3 sm:px-6">
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-brand-800 px-2.5 py-1 text-xs font-semibold text-white">Q {current + 1} / {questions.length}</span>
                <span className="text-xs text-ink-500">{subjects[q.subject_id] ?? "Subject"}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-ink-500">
                <span className="rounded-md bg-forest-50 px-2 py-0.5 text-forest-800">+{q.marks}</span>
                <span className="rounded-md bg-red-50 px-2 py-0.5 text-red-700">−{q.negative_marks}</span>
                {state.marked && <span className="inline-flex items-center gap-1 rounded-md bg-saffron-50 px-2 py-0.5 text-saffron-800"><Flag className="h-3 w-3" aria-hidden="true" /> Marked</span>}
              </div>
            </div>
            <div className="flex-1 px-4 py-5 sm:px-6" lang={q.language === "hi" ? "hi" : "en"}>
              <p className="text-base leading-relaxed text-ink-900 sm:text-lg">{q.text}</p>
              <div role="radiogroup" aria-label="Options" className="mt-6 grid gap-2.5">
                {options.map((o, i) => {
                  const active = state.selected === o.key;
                  return (
                    <button
                      key={o.key}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => select(o.key)}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors sm:text-base",
                        active ? "border-brand-500 bg-brand-50 text-brand-900 ring-2 ring-brand-100" : "border-ink-200 bg-white text-ink-900 hover:border-brand-300 hover:bg-ink-50",
                      )}
                    >
                      <span className={cn("mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold", active ? "border-brand-600 bg-brand-600 text-white" : "border-ink-300 text-ink-700")}>{o.key}</span>
                      <span className="flex-1">{o.text}</span>
                      <kbd className="hidden text-[10px] text-ink-300 sm:block">{i + 1}</kbd>
                    </button>
                  );
                })}
              </div>
            </div>
            {/* Action bar */}
            <div className="sticky bottom-0 flex flex-wrap items-center gap-2 rounded-b-2xl border-t border-ink-100 bg-white px-4 py-3 sm:px-6">
              <Button type="button" variant="outline" size="sm" onClick={() => goTo(current - 1)} disabled={current === 0}><ChevronLeft className="h-4 w-4" aria-hidden="true" /> Previous</Button>
              <Button type="button" variant="ghost" size="sm" onClick={clear} disabled={!state.selected}>Clear response</Button>
              <Button type="button" variant="secondary" size="sm" onClick={() => toggleMark(true)} className="ml-auto">
                <Flag className="h-4 w-4" aria-hidden="true" /> {state.marked ? "Unmark" : "Mark for review"} &amp; next
              </Button>
              {current < questions.length - 1 ? (
                <Button type="button" size="sm" onClick={() => goTo(current + 1)}>Save &amp; next <ChevronRight className="h-4 w-4" aria-hidden="true" /></Button>
              ) : (
                <Button type="button" size="sm" variant="forest" onClick={() => setConfirmOpen(true)}>Review &amp; submit</Button>
              )}
            </div>
          </div>
          <p className="mt-2 hidden text-center text-[11px] text-ink-500 lg:block">Shortcuts: 1–4 select option · N / → next · P / ← previous · M mark for review</p>
        </section>

        {/* Palette (desktop) */}
        <aside className="hidden w-72 shrink-0 lg:block">
          <div className="sticky top-20">
            <Palette questions={questions} current={current} stateOf={paletteState} counts={counts} onPick={goTo} />
          </div>
        </aside>
      </div>

      {/* Palette (mobile drawer) */}
      {paletteOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Question palette">
          <button type="button" className="absolute inset-0 bg-ink-900/40" onClick={() => setPaletteOpen(false)} aria-label="Close palette" />
          <div className="absolute inset-y-0 right-0 w-[min(20rem,90vw)] overflow-y-auto bg-white p-4 shadow-pop">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold">Question palette</p>
              <button type="button" onClick={() => setPaletteOpen(false)} className="rounded-lg p-1.5 hover:bg-ink-100" aria-label="Close"><X className="h-4 w-4" /></button>
            </div>
            <Palette questions={questions} current={current} stateOf={paletteState} counts={counts} onPick={goTo} bare />
          </div>
        </div>
      )}

      {/* Submit confirmation */}
      <Dialog open={confirmOpen} onClose={() => !submitting && setConfirmOpen(false)} title="Submit test?" size="sm">
        <p className="text-sm text-ink-700">Once submitted you cannot change your answers. Your result and solutions will be shown immediately.</p>
        <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-xl bg-forest-50 p-3"><dt className="text-xs text-forest-700">Attempted</dt><dd className="text-xl font-bold text-forest-900">{attemptedCount}</dd></div>
          <div className="rounded-xl bg-ink-100 p-3"><dt className="text-xs text-ink-500">Unattempted</dt><dd className="text-xl font-bold text-ink-900">{questions.length - attemptedCount}</dd></div>
          <div className="rounded-xl bg-saffron-50 p-3"><dt className="text-xs text-saffron-800">Marked for review</dt><dd className="text-xl font-bold text-ink-900">{counts.marked + counts["answered-marked"]}</dd></div>
          <div className="rounded-xl bg-brand-50 p-3"><dt className="text-xs text-brand-700">Time left</dt><dd className="text-xl font-bold text-brand-900 tabular-nums">{timeLabel}</dd></div>
        </dl>
        {counts.marked > 0 && <p className="mt-3 text-xs text-saffron-800">{counts.marked} marked question{counts.marked > 1 ? "s have" : " has"} no answer selected and will count as unattempted.</p>}
        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => setConfirmOpen(false)} disabled={submitting}>Keep answering</Button>
          <Button type="button" variant="forest" onClick={() => submit(false)} loading={submitting}>Submit test</Button>
        </div>
      </Dialog>

      {timeoutNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 p-4">
          <div className="rounded-2xl bg-white p-6 text-center shadow-pop">
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-brand-700" aria-hidden="true" />
            <p className="mt-3 font-semibold text-ink-900">Time&apos;s up — submitting your test…</p>
          </div>
        </div>
      )}
    </div>
  );
}

const paletteStyles: Record<PaletteState, string> = {
  answered: "bg-forest-600 text-white border-forest-600",
  "not-answered": "bg-red-50 text-red-700 border-red-200",
  marked: "bg-saffron-500 text-ink-900 border-saffron-500",
  "answered-marked": "bg-saffron-500 text-ink-900 border-saffron-500 ring-2 ring-forest-500 ring-offset-1",
  "not-visited": "bg-white text-ink-700 border-ink-200",
};

function Palette({ questions, current, stateOf, counts, onPick, bare }: {
  questions: DeliveredQuestion[]; current: number; stateOf: (id: string) => PaletteState;
  counts: Record<PaletteState, number>; onPick: (i: number) => void; bare?: boolean;
}) {
  return (
    <div className={cn(!bare && "rounded-2xl border border-ink-200 bg-white p-4 shadow-card")}>
      {!bare && <p className="mb-3 text-sm font-semibold text-ink-900">Question palette</p>}
      <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-7 lg:grid-cols-6" role="list">
        {questions.map((qq, i) => (
          <button
            key={qq.id}
            type="button"
            role="listitem"
            onClick={() => onPick(i)}
            aria-current={i === current ? "true" : undefined}
            aria-label={`Question ${i + 1}: ${stateOf(qq.id).replace("-", " ")}`}
            className={cn("flex h-9 items-center justify-center rounded-lg border text-xs font-semibold transition-shadow", paletteStyles[stateOf(qq.id)], i === current && "shadow-[0_0_0_2px_#1e4fa3]")}
          >
            {i + 1}
          </button>
        ))}
      </div>
      <ul className="mt-4 grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px] text-ink-700">
        <li className="flex items-center gap-1.5"><span className={cn("h-3.5 w-3.5 rounded border", paletteStyles.answered)} /> Answered ({counts.answered})</li>
        <li className="flex items-center gap-1.5"><span className={cn("h-3.5 w-3.5 rounded border", paletteStyles["not-answered"])} /> Not answered ({counts["not-answered"]})</li>
        <li className="flex items-center gap-1.5"><span className={cn("h-3.5 w-3.5 rounded border", paletteStyles.marked)} /> Marked ({counts.marked})</li>
        <li className="flex items-center gap-1.5"><span className={cn("h-3.5 w-3.5 rounded border", paletteStyles["answered-marked"])} /> Answered &amp; marked ({counts["answered-marked"]})</li>
        <li className="flex items-center gap-1.5"><span className={cn("h-3.5 w-3.5 rounded border", paletteStyles["not-visited"])} /> Not visited ({counts["not-visited"]})</li>
      </ul>
    </div>
  );
}
