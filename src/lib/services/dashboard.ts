import "server-only";
import { db } from "@/lib/data";
import type {
  Bookmark, Material, MockTest, Profile, Question, Subject, TestAttempt, TestAnswer, StudyProgress,
} from "@/lib/types";
import { todayKey } from "@/lib/utils";

export interface SubjectStat {
  subject: Subject;
  attempted: number;
  correct: number;
  accuracy: number; // 0-100
}

export interface ContinueItem {
  kind: "book" | "note";
  material: Material;
  progress: StudyProgress;
}

export interface DashboardData {
  profile: Profile | null;
  attempts: TestAttempt[]; // submitted, newest first
  inProgress: TestAttempt | null;
  testsAttempted: number;
  averageScore: number; // percentage
  overallAccuracy: number;
  studyProgress: number; // 0-100
  continueLearning: ContinueItem[];
  recommendedTests: MockTest[];
  recentTests: TestAttempt[];
  savedMaterials: { kind: "book" | "note"; material: Material }[];
  bookmarkedQuestionCount: number;
  bookmarkedTestCount: number;
  subjectStats: SubjectStat[];
  weakSubjects: SubjectStat[];
  strongSubjects: SubjectStat[];
  streakDays: number;
  scoreTrend: { label: string; value: number }[];
  weeklyActivity: { label: string; value: number }[];
}

const dayLabel = (d: Date) => d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });

/** Update the study streak once per calendar day (idempotent). */
export async function touchStudyStreak(userId: string): Promise<Profile | null> {
  const store = await db();
  const profile = await store.getById("profiles", userId);
  if (!profile) return null;
  const today = todayKey();
  if (profile.last_active_date === today) return profile;
  const yesterday = todayKey(new Date(Date.now() - 86_400_000));
  const streak = profile.last_active_date === yesterday ? profile.study_streak_days + 1 : 1;
  return store.update("profiles", userId, { last_active_date: today, study_streak_days: streak, updated_at: new Date().toISOString() });
}

export async function getDashboardData(userId: string): Promise<DashboardData> {
  const store = await db();
  const [profile, allAttempts, subjects, progressRows, bookmarks, publishedTests] = await Promise.all([
    store.getById("profiles", userId),
    store.select("test_attempts", { eq: { user_id: userId }, order: [{ column: "created_at", ascending: false }] }),
    store.select("subjects", { order: [{ column: "sort_order" }] }),
    store.select("study_progress", { eq: { user_id: userId }, order: [{ column: "updated_at", ascending: false }] }),
    store.select("bookmarks", { eq: { user_id: userId }, order: [{ column: "created_at", ascending: false }] }),
    store.select("mock_tests", { eq: { is_published: true }, order: [{ column: "attempts_count", ascending: false }] }),
  ]);

  const attempts = allAttempts.filter((a) => a.status === "submitted");
  const inProgress = allAttempts.find((a) => a.status === "in_progress") ?? null;

  // Headline numbers
  const testsAttempted = attempts.length;
  const averageScore = testsAttempted ? round1(attempts.reduce((s, a) => s + Number(a.percentage), 0) / testsAttempted) : 0;
  const totalAttempted = attempts.reduce((s, a) => s + a.attempted, 0);
  const totalCorrect = attempts.reduce((s, a) => s + a.correct, 0);
  const overallAccuracy = totalAttempted ? round1((totalCorrect / totalAttempted) * 100) : 0;

  // Subject performance from answers of recent attempts (cap to keep queries bounded)
  const recentForSubjects = attempts.slice(0, 20);
  const answers: TestAnswer[] = recentForSubjects.length
    ? await store.select("test_answers", { in: { attempt_id: recentForSubjects.map((a) => a.id) } })
    : [];
  const answeredQids = Array.from(new Set(answers.filter((a) => a.selected_option).map((a) => a.question_id)));
  const questions: Question[] = answeredQids.length ? await store.select("questions", { in: { id: answeredQids } }) : [];
  const qSubject = new Map(questions.map((q) => [q.id, q.subject_id]));
  const perSubject = new Map<string, { attempted: number; correct: number }>();
  for (const ans of answers) {
    if (!ans.selected_option) continue;
    const sid = qSubject.get(ans.question_id);
    if (!sid) continue;
    const cur = perSubject.get(sid) ?? { attempted: 0, correct: 0 };
    cur.attempted += 1;
    if (ans.is_correct) cur.correct += 1;
    perSubject.set(sid, cur);
  }
  // Fallback: subject-wise attempts without answer rows still count via attempt totals
  for (const a of attempts) {
    if (!a.subject_id || perSubject.has(a.subject_id)) continue;
    perSubject.set(a.subject_id, { attempted: a.attempted, correct: a.correct });
  }
  const subjectStats: SubjectStat[] = subjects
    .filter((s) => perSubject.has(s.id))
    .map((s) => {
      const v = perSubject.get(s.id)!;
      return { subject: s, attempted: v.attempted, correct: v.correct, accuracy: v.attempted ? round1((v.correct / v.attempted) * 100) : 0 };
    })
    .filter((s) => s.attempted >= 3)
    .sort((a, b) => b.accuracy - a.accuracy);
  const weakSubjects = subjectStats.filter((s) => s.accuracy < 60).sort((a, b) => a.accuracy - b.accuracy).slice(0, 4);
  const strongSubjects = subjectStats.filter((s) => s.accuracy >= 75).slice(0, 4);

  // Continue learning (materials with progress)
  const bookIds = progressRows.filter((p) => p.item_type === "book").map((p) => p.item_id);
  const noteIds = progressRows.filter((p) => p.item_type === "note").map((p) => p.item_id);
  const savedBookIds = bookmarks.filter((b) => b.item_type === "book").map((b) => b.item_id);
  const savedNoteIds = bookmarks.filter((b) => b.item_type === "note").map((b) => b.item_id);
  const [books, notes] = await Promise.all([
    uniq([...bookIds, ...savedBookIds]).length ? store.select("books", { in: { id: uniq([...bookIds, ...savedBookIds]) } }) : Promise.resolve([] as Material[]),
    uniq([...noteIds, ...savedNoteIds]).length ? store.select("notes", { in: { id: uniq([...noteIds, ...savedNoteIds]) } }) : Promise.resolve([] as Material[]),
  ]);
  const bookMap = new Map(books.map((b) => [b.id, b]));
  const noteMap = new Map(notes.map((n) => [n.id, n]));
  const continueLearning: ContinueItem[] = progressRows
    .filter((p) => p.item_type !== "exam" && p.progress_percent < 100)
    .map((p) => {
      const material = p.item_type === "book" ? bookMap.get(p.item_id) : noteMap.get(p.item_id);
      return material ? { kind: p.item_type as "book" | "note", material, progress: p } : null;
    })
    .filter((x): x is ContinueItem => Boolean(x))
    .slice(0, 4);
  const materialProgress = progressRows.filter((p) => p.item_type !== "exam");
  const studyProgress = materialProgress.length
    ? Math.round(materialProgress.reduce((s, p) => s + p.progress_percent, 0) / materialProgress.length)
    : 0;

  const savedMaterials = bookmarks
    .filter((b) => b.item_type === "book" || b.item_type === "note")
    .map((b) => {
      const material = b.item_type === "book" ? bookMap.get(b.item_id) : noteMap.get(b.item_id);
      return material ? { kind: b.item_type as "book" | "note", material } : null;
    })
    .filter((x): x is { kind: "book" | "note"; material: Material } => Boolean(x))
    .slice(0, 5);

  // Recommended tests: preferred exam, not yet attempted; fall back to popular
  const attemptedTestIds = new Set(attempts.map((a) => a.mock_test_id).filter(Boolean));
  const notAttempted = publishedTests.filter((t) => !attemptedTestIds.has(t.id));
  const preferred = profile?.preferred_exam_id ? notAttempted.filter((t) => t.exam_id === profile.preferred_exam_id) : [];
  const recommendedTests = uniqBy([...preferred, ...notAttempted], (t) => t.id).slice(0, 4);

  // Charts
  const scoreTrend = [...attempts].slice(0, 10).reverse().map((a) => ({
    label: dayLabel(new Date(a.submitted_at ?? a.created_at)),
    value: Number(a.percentage),
  }));
  const weeklyActivity: { label: string; value: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86_400_000);
    const key = todayKey(d);
    const count = attempts.filter((a) => (a.submitted_at ?? a.created_at).slice(0, 10) === key).length
      + progressRows.filter((p) => p.updated_at.slice(0, 10) === key).length;
    weeklyActivity.push({ label: d.toLocaleDateString("en-IN", { weekday: "short" }), value: count });
  }

  return {
    profile,
    attempts,
    inProgress,
    testsAttempted,
    averageScore,
    overallAccuracy,
    studyProgress,
    continueLearning,
    recommendedTests,
    recentTests: attempts.slice(0, 5),
    savedMaterials,
    bookmarkedQuestionCount: bookmarks.filter((b: Bookmark) => b.item_type === "question").length,
    bookmarkedTestCount: bookmarks.filter((b: Bookmark) => b.item_type === "mock_test").length,
    subjectStats,
    weakSubjects,
    strongSubjects,
    streakDays: profile?.study_streak_days ?? 0,
    scoreTrend,
    weeklyActivity,
  };
}

const round1 = (n: number) => Math.round(n * 10) / 10;
const uniq = <T,>(arr: T[]) => Array.from(new Set(arr));
function uniqBy<T>(arr: T[], key: (t: T) => string): T[] {
  const seen = new Set<string>();
  return arr.filter((t) => (seen.has(key(t)) ? false : (seen.add(key(t)), true)));
}
