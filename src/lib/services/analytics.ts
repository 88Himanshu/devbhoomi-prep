import "server-only";
import { db } from "@/lib/data";
import type { Question, Subject, TestAttempt } from "@/lib/types";
import { getSubjectMap } from "./catalog";

export interface SubjectStat {
  subject: Subject;
  questions: number;
  attempted: number;
  correct: number;
  accuracy: number;
}

export interface StudentAnalytics {
  totals: { attempts: number; avg_score_pct: number; avg_accuracy: number; best_pct: number; total_time_seconds: number; questions_answered: number };
  score_history: { label: string; value: number; accuracy: number; date: string; title: string }[];
  subject_accuracy: SubjectStat[];
  weak_subjects: SubjectStat[];
  strong_subjects: SubjectStat[];
  time_management: { label: string; value: number; allotted: number; title: string }[];
  improvement: { first_avg: number; last_avg: number; delta: number; sample: number } | null;
  weekly_activity: { label: string; value: number; date: string }[];
  study_days_last_14: number;
}

const short = (iso: string) => new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

export async function getStudentAnalytics(userId: string): Promise<StudentAnalytics> {
  const store = await db();
  const attempts = (await store.select("test_attempts", {
    eq: { user_id: userId, status: "submitted" },
    order: [{ column: "submitted_at", ascending: true }],
  })) as TestAttempt[];
  const subjectMap = await getSubjectMap();

  // Score history & totals
  const score_history = attempts.map((a) => ({
    label: short(a.submitted_at ?? a.started_at),
    value: a.percentage,
    accuracy: a.accuracy,
    date: a.submitted_at ?? a.started_at,
    title: a.title,
  }));
  const n = attempts.length;
  const avg = (f: (a: TestAttempt) => number) => (n ? Math.round((attempts.reduce((s, a) => s + f(a), 0) / n) * 10) / 10 : 0);
  const totals = {
    attempts: n,
    avg_score_pct: avg((a) => a.percentage),
    avg_accuracy: avg((a) => a.accuracy),
    best_pct: n ? Math.max(...attempts.map((a) => a.percentage)) : 0,
    total_time_seconds: attempts.reduce((s, a) => s + (a.time_taken_seconds ?? 0), 0),
    questions_answered: attempts.reduce((s, a) => s + a.attempted, 0),
  };

  // Subject accuracy from graded answers
  const attemptIds = attempts.map((a) => a.id);
  const answers = attemptIds.length ? await store.select("test_answers", { in: { attempt_id: attemptIds } }) : [];
  const qIds = [...new Set(answers.map((a) => a.question_id))];
  const questions: Question[] = [];
  for (let i = 0; i < qIds.length; i += 200) questions.push(...(await store.select("questions", { in: { id: qIds.slice(i, i + 200) } })));
  const qMap = new Map(questions.map((q) => [q.id, q]));
  const per = new Map<string, SubjectStat>();
  for (const a of answers) {
    const q = qMap.get(a.question_id);
    if (!q) continue;
    const subject = subjectMap.get(q.subject_id);
    if (!subject) continue;
    const s = per.get(q.subject_id) ?? { subject, questions: 0, attempted: 0, correct: 0, accuracy: 0 };
    s.questions += 1;
    if (a.selected_option) {
      s.attempted += 1;
      const ok = a.is_correct ?? a.selected_option === q.correct_option;
      if (ok) s.correct += 1;
    }
    per.set(q.subject_id, s);
  }
  const subject_accuracy = [...per.values()]
    .map((s) => ({ ...s, accuracy: s.attempted ? Math.round((s.correct / s.attempted) * 1000) / 10 : 0 }))
    .sort((a, b) => b.accuracy - a.accuracy);
  const eligible = subject_accuracy.filter((s) => s.attempted >= 5);
  const weak_subjects = eligible.filter((s) => s.accuracy < 60).sort((a, b) => a.accuracy - b.accuracy);
  const strong_subjects = eligible.filter((s) => s.accuracy >= 75);

  // Time management (last 10 attempts)
  const time_management = attempts.slice(-10).map((a) => ({
    label: short(a.submitted_at ?? a.started_at),
    value: a.total_questions ? Math.round((a.time_taken_seconds ?? 0) / a.total_questions) : 0,
    allotted: a.total_questions ? Math.round((a.duration_minutes * 60) / a.total_questions) : 0,
    title: a.title,
  }));

  // Improvement: first 3 vs last 3
  let improvement: StudentAnalytics["improvement"] = null;
  if (n >= 4) {
    const k = Math.min(3, Math.floor(n / 2));
    const mean = (arr: TestAttempt[]) => Math.round((arr.reduce((s, a) => s + a.percentage, 0) / arr.length) * 10) / 10;
    const first_avg = mean(attempts.slice(0, k));
    const last_avg = mean(attempts.slice(-k));
    improvement = { first_avg, last_avg, delta: Math.round((last_avg - first_avg) * 10) / 10, sample: k };
  }

  // Weekly activity: attempts per day, last 14 days
  const days: { label: string; value: number; date: string }[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 86_400_000);
    const key = d.toISOString().slice(0, 10);
    days.push({ label: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }), value: 0, date: key });
  }
  const dayIndex = new Map(days.map((d, i) => [d.date, i]));
  for (const a of attempts) {
    const key = (a.submitted_at ?? a.started_at).slice(0, 10);
    const idx = dayIndex.get(key);
    if (idx !== undefined) days[idx].value += 1;
  }

  return {
    totals,
    score_history,
    subject_accuracy,
    weak_subjects,
    strong_subjects,
    time_management,
    improvement,
    weekly_activity: days,
    study_days_last_14: days.filter((d) => d.value > 0).length,
  };
}
