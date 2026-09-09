import "server-only";
import { createHash } from "node:crypto";
import { adminDb, db } from "@/lib/data";
import type {
  CustomTestConfig, Difficulty, MockTest, OptionKey, Question, TestAnswer, TestAttempt,
} from "@/lib/types";

/** Question as delivered to an in-progress attempt (answers stripped). */
export type DeliveredQuestion = Omit<Question, "correct_option" | "explanation">;

export class TestError extends Error {
  constructor(message: string, public status: 400 | 403 | 404 | 409 | 402 = 400) {
    super(message);
  }
}

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Deterministic shuffle seeded by a string (stable per attempt). */
export function seededShuffle<T>(items: T[], seed: string): T[] {
  const out = [...items];
  let h = parseInt(createHash("sha256").update(seed).digest("hex").slice(0, 8), 16) || 1;
  const rand = () => {
    h ^= h << 13; h >>>= 0;
    h ^= h >>> 17;
    h ^= h << 5; h >>>= 0;
    return (h >>> 0) / 4294967296;
  };
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function remainingSeconds(attempt: TestAttempt, now = Date.now()): number {
  const end = new Date(attempt.started_at).getTime() + attempt.duration_minutes * 60_000;
  return Math.max(0, Math.floor((end - now) / 1000));
}

export const isExpired = (attempt: TestAttempt) => remainingSeconds(attempt) <= 0;

export function stripAnswers(q: Question): DeliveredQuestion {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { correct_option, explanation, ...rest } = q;
  return rest;
}

async function loadQuestions(ids: string[]): Promise<Question[]> {
  if (!ids.length) return [];
  const store = await db();
  const rows: Question[] = [];
  for (let i = 0; i < ids.length; i += 200) {
    rows.push(...(await store.select("questions", { in: { id: ids.slice(i, i + 200) } })));
  }
  const map = new Map(rows.map((q) => [q.id, q]));
  return ids.map((id) => map.get(id)).filter((q): q is Question => Boolean(q));
}

/* ------------------------------------------------------------------ */
/* Mock test reads                                                    */
/* ------------------------------------------------------------------ */

export async function getMockTestQuestionIds(mockTestId: string): Promise<string[]> {
  const rows = await (await db()).select("mock_test_questions", {
    eq: { mock_test_id: mockTestId },
    order: [{ column: "sort_order" }],
  });
  return rows.map((r) => r.question_id);
}

export async function getMockTestQuestions(mockTestId: string): Promise<Question[]> {
  return loadQuestions(await getMockTestQuestionIds(mockTestId));
}

/** Subject breakdown of a mock test (count per subject_id). */
export function subjectBreakdown(questions: Question[]): { subject_id: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const q of questions) counts.set(q.subject_id, (counts.get(q.subject_id) ?? 0) + 1);
  return [...counts.entries()].map(([subject_id, count]) => ({ subject_id, count })).sort((a, b) => b.count - a.count);
}

/* ------------------------------------------------------------------ */
/* Attempts                                                           */
/* ------------------------------------------------------------------ */

export async function getUserAttempts(userId: string, opts: { limit?: number; offset?: number; mockTestId?: string; status?: TestAttempt["status"] } = {}): Promise<TestAttempt[]> {
  return (await db()).select("test_attempts", {
    eq: { user_id: userId, ...(opts.mockTestId ? { mock_test_id: opts.mockTestId } : {}), ...(opts.status ? { status: opts.status } : {}) },
    order: [{ column: "started_at", ascending: false }],
    limit: opts.limit,
    offset: opts.offset,
  });
}

export async function countUserAttempts(userId: string): Promise<number> {
  return (await db()).count("test_attempts", { eq: { user_id: userId } });
}

/** Attempt owned by the user, or throws (404 unknown, 403 other user's). */
export async function getAttemptForUser(attemptId: string, userId: string): Promise<TestAttempt> {
  const attempt = await (await db()).getById("test_attempts", attemptId);
  if (!attempt) throw new TestError("Attempt not found", 404);
  if (attempt.user_id !== userId) throw new TestError("You do not have access to this attempt", 403);
  return attempt;
}

export async function getAttemptAnswers(attemptId: string): Promise<TestAnswer[]> {
  return (await db()).select("test_answers", { eq: { attempt_id: attemptId } });
}

/** Ordered questions for an attempt with answers stripped (for delivery). */
export async function getAttemptQuestions(attempt: TestAttempt): Promise<DeliveredQuestion[]> {
  return (await loadQuestions(attempt.question_ids)).map(stripAnswers);
}

export async function createAttemptFromMock(userId: string, mock: MockTest): Promise<TestAttempt> {
  const store = await db();
  const existing = await store.selectOne("test_attempts", { eq: { user_id: userId, mock_test_id: mock.id, status: "in_progress" } });
  if (existing && !isExpired(existing)) return existing;
  if (existing) await finalizeAttempt(existing);
  const ids = await getMockTestQuestionIds(mock.id);
  if (ids.length === 0) throw new TestError("This test has no questions yet", 400);
  const now = new Date().toISOString();
  return store.insert("test_attempts", {
    user_id: userId,
    mock_test_id: mock.id,
    title: mock.title,
    exam_id: mock.exam_id,
    subject_id: mock.subject_id,
    status: "in_progress",
    question_ids: ids,
    config: null,
    duration_minutes: mock.duration_minutes,
    started_at: now,
    submitted_at: null,
    time_taken_seconds: null,
    total_questions: ids.length,
    attempted: 0, correct: 0, incorrect: 0, unattempted: ids.length,
    score: 0,
    total_marks: mock.total_marks || ids.length,
    percentage: 0, accuracy: 0, percentile: null,
  });
}

/** Question pool available for a custom test config (exam-specific + generic, widened to subject-only when thin). */
export async function customPool(config: Omit<CustomTestConfig, "question_count">): Promise<Question[]> {
  const store = await db();
  const eq: Partial<Question> = { is_active: true };
  if (config.subject_id) eq.subject_id = config.subject_id;
  if (config.difficulty !== "mixed") eq.difficulty = config.difficulty as Difficulty;
  const all = await store.select("questions", { eq });
  const examScoped = all.filter((q) => q.exam_id === config.exam_id || q.exam_id === null);
  return examScoped.length >= 10 ? examScoped : all;
}

export async function customPoolCounts(examId: string): Promise<Record<string, Record<string, number>>> {
  const store = await db();
  const all = await store.select("questions", { eq: { is_active: true } });
  const out: Record<string, Record<string, number>> = {};
  const bump = (subject: string, diff: string) => {
    out[subject] ??= { easy: 0, medium: 0, hard: 0, mixed: 0 };
    out[subject][diff] += 1;
    out[subject].mixed += 1;
  };
  const scoped = all.filter((q) => q.exam_id === examId || q.exam_id === null);
  const pool = scoped.length >= 10 ? scoped : all;
  for (const q of pool) {
    bump(q.subject_id, q.difficulty);
    bump("all", q.difficulty);
  }
  return out;
}

export async function createCustomAttempt(userId: string, config: CustomTestConfig, examName: string, subjectName: string | null): Promise<TestAttempt> {
  const pool = await customPool(config);
  if (pool.length < 5) throw new TestError("Not enough questions match this selection. Try a broader subject or difficulty.", 400);
  const count = Math.min(config.question_count, pool.length);
  const seed = `${userId}:${Date.now()}`;
  const chosen = seededShuffle(pool, seed).slice(0, count);
  const negative = chosen.reduce((s, q) => s + q.negative_marks, 0) / chosen.length;
  const totalMarks = chosen.reduce((s, q) => s + q.marks, 0);
  const diffLabel = config.difficulty === "mixed" ? "Mixed" : config.difficulty[0].toUpperCase() + config.difficulty.slice(1);
  const title = `Custom · ${examName} · ${subjectName ?? "All subjects"} · ${diffLabel} (${count} Qs)`;
  void negative;
  return (await db()).insert("test_attempts", {
    user_id: userId,
    mock_test_id: null,
    title,
    exam_id: config.exam_id,
    subject_id: config.subject_id,
    status: "in_progress",
    question_ids: chosen.map((q) => q.id),
    config: { ...config, question_count: count },
    duration_minutes: Math.ceil(count * 1.2),
    started_at: new Date().toISOString(),
    submitted_at: null,
    time_taken_seconds: null,
    total_questions: count,
    attempted: 0, correct: 0, incorrect: 0, unattempted: count,
    score: 0,
    total_marks: totalMarks,
    percentage: 0, accuracy: 0, percentile: null,
  });
}

export interface SaveAnswerInput {
  selected_option?: OptionKey | null;
  marked_for_review?: boolean;
  time_spent_seconds?: number;
}

/** Upsert a single answer. Auto-finalises the attempt if time has elapsed. */
export async function saveAnswer(attempt: TestAttempt, questionId: string, input: SaveAnswerInput): Promise<{ answer: TestAnswer | null; finalized: TestAttempt | null }> {
  if (attempt.status === "submitted") throw new TestError("This attempt has already been submitted", 409);
  if (isExpired(attempt)) return { answer: null, finalized: await finalizeAttempt(attempt) };
  if (!attempt.question_ids.includes(questionId)) throw new TestError("Question is not part of this attempt", 400);
  const store = await db();
  const existing = await store.selectOne("test_answers", { eq: { attempt_id: attempt.id, question_id: questionId } });
  const now = new Date().toISOString();
  if (existing) {
    const patch: Partial<TestAnswer> = { updated_at: now };
    if (input.selected_option !== undefined) patch.selected_option = input.selected_option;
    if (input.marked_for_review !== undefined) patch.marked_for_review = input.marked_for_review;
    if (input.time_spent_seconds !== undefined) patch.time_spent_seconds = existing.time_spent_seconds + Math.max(0, Math.min(input.time_spent_seconds, 3600));
    return { answer: await store.update("test_answers", existing.id, patch), finalized: null };
  }
  const answer = await store.insert("test_answers", {
    attempt_id: attempt.id,
    question_id: questionId,
    selected_option: input.selected_option ?? null,
    is_correct: null,
    marked_for_review: input.marked_for_review ?? false,
    time_spent_seconds: Math.max(0, Math.min(input.time_spent_seconds ?? 0, 3600)),
    updated_at: now,
  });
  return { answer, finalized: null };
}

/** Grade and close an attempt. Idempotent: returns the attempt as-is when already submitted. */
export async function finalizeAttempt(attempt: TestAttempt): Promise<TestAttempt> {
  if (attempt.status === "submitted") return attempt;
  const store = await db();
  const [questions, answers] = await Promise.all([loadQuestions(attempt.question_ids), getAttemptAnswers(attempt.id)]);
  const byQ = new Map(answers.map((a) => [a.question_id, a]));
  let correct = 0, incorrect = 0, score = 0, totalMarks = 0;
  for (const q of questions) {
    totalMarks += q.marks;
    const a = byQ.get(q.id);
    if (!a || !a.selected_option) continue;
    const ok = a.selected_option === q.correct_option;
    if (ok) { correct += 1; score += q.marks; } else { incorrect += 1; score -= q.negative_marks; }
    if (a.is_correct !== ok) await store.update("test_answers", a.id, { is_correct: ok });
  }
  const attempted = correct + incorrect;
  const total = questions.length || attempt.total_questions;
  const unattempted = total - attempted;
  score = Math.round(score * 100) / 100;
  const marks = totalMarks || attempt.total_marks || total;
  const percentage = Math.max(0, Math.round((score / marks) * 1000) / 10);
  const accuracy = attempted ? Math.round((correct / attempted) * 1000) / 10 : 0;
  const now = Date.now();
  const elapsed = Math.floor((now - new Date(attempt.started_at).getTime()) / 1000);
  const timeTaken = Math.min(elapsed, attempt.duration_minutes * 60);

  const percentile = attempt.mock_test_id ? await computePercentile(attempt.mock_test_id, attempt.user_id, score) : null;

  const updated = await store.update("test_attempts", attempt.id, {
    status: "submitted",
    submitted_at: new Date(now).toISOString(),
    time_taken_seconds: timeTaken,
    total_questions: total,
    attempted, correct, incorrect, unattempted,
    score, total_marks: marks, percentage, accuracy, percentile,
  });

  if (attempt.mock_test_id) {
    const admin = await adminDb();
    const mock = await admin.getById("mock_tests", attempt.mock_test_id);
    if (mock) await admin.update("mock_tests", mock.id, { attempts_count: mock.attempts_count + 1 });
  }
  return updated;
}

export async function submitAttempt(attemptId: string, userId: string): Promise<TestAttempt> {
  const attempt = await getAttemptForUser(attemptId, userId);
  if (attempt.status === "submitted") throw new TestError("This attempt has already been submitted", 409);
  return finalizeAttempt(attempt);
}

/** Percentile among OTHER users' submitted attempts on the same mock (needs ≥ 5). */
export async function computePercentile(mockTestId: string, userId: string, score: number): Promise<number | null> {
  const others = (await (await adminDb()).select("test_attempts", { eq: { mock_test_id: mockTestId, status: "submitted" } }))
    .filter((a) => a.user_id !== userId);
  if (others.length < 5) return null;
  const below = others.filter((a) => a.score < score).length;
  return Math.round((below / others.length) * 1000) / 10;
}

/* ------------------------------------------------------------------ */
/* Results                                                            */
/* ------------------------------------------------------------------ */

export interface ResultQuestion {
  question: Question;
  index: number;
  selected: OptionKey | null;
  is_correct: boolean | null; // null = unattempted
  marked_for_review: boolean;
  time_spent_seconds: number;
}

export interface SubjectResult {
  subject_id: string;
  total: number;
  attempted: number;
  correct: number;
  incorrect: number;
  accuracy: number; // % of attempted
  score_pct: number; // correct / total
}

export interface ResultDetail {
  attempt: TestAttempt;
  questions: ResultQuestion[];
  subjects: SubjectResult[];
  avg_seconds_per_question: number;
  allotted_seconds_per_question: number;
}

export async function getResultDetail(attempt: TestAttempt): Promise<ResultDetail> {
  const [questions, answers] = await Promise.all([loadQuestions(attempt.question_ids), getAttemptAnswers(attempt.id)]);
  const byQ = new Map(answers.map((a) => [a.question_id, a]));
  const rows: ResultQuestion[] = questions.map((q, i) => {
    const a = byQ.get(q.id);
    const selected = a?.selected_option ?? null;
    return {
      question: q,
      index: i + 1,
      selected,
      is_correct: selected ? selected === q.correct_option : null,
      marked_for_review: a?.marked_for_review ?? false,
      time_spent_seconds: a?.time_spent_seconds ?? 0,
    };
  });
  const subj = new Map<string, SubjectResult>();
  for (const r of rows) {
    const s = subj.get(r.question.subject_id) ?? { subject_id: r.question.subject_id, total: 0, attempted: 0, correct: 0, incorrect: 0, accuracy: 0, score_pct: 0 };
    s.total += 1;
    if (r.is_correct !== null) s.attempted += 1;
    if (r.is_correct === true) s.correct += 1;
    if (r.is_correct === false) s.incorrect += 1;
    subj.set(s.subject_id, s);
  }
  for (const s of subj.values()) {
    s.accuracy = s.attempted ? Math.round((s.correct / s.attempted) * 1000) / 10 : 0;
    s.score_pct = s.total ? Math.round((s.correct / s.total) * 1000) / 10 : 0;
  }
  const n = rows.length || 1;
  return {
    attempt,
    questions: rows,
    subjects: [...subj.values()].sort((a, b) => b.total - a.total),
    avg_seconds_per_question: Math.round((attempt.time_taken_seconds ?? 0) / n),
    allotted_seconds_per_question: Math.round((attempt.duration_minutes * 60) / n),
  };
}

/** Best submitted score per mock test for a user (for list badges). */
export async function bestScoresByMock(userId: string): Promise<Map<string, TestAttempt>> {
  const attempts = await (await db()).select("test_attempts", { eq: { user_id: userId, status: "submitted" } });
  const best = new Map<string, TestAttempt>();
  for (const a of attempts) {
    if (!a.mock_test_id) continue;
    const cur = best.get(a.mock_test_id);
    if (!cur || a.percentage > cur.percentage) best.set(a.mock_test_id, a);
  }
  return best;
}
