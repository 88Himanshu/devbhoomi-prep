import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { BarChart3, CheckCircle2, Clock, HelpCircle, ListChecks, Percent, RotateCcw, Target, Trophy, Users, XCircle } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { getAccess } from "@/lib/access";
import { db } from "@/lib/data";
import { getExamMap, getSubjectMap } from "@/lib/services/catalog";
import { bookmarkedIds } from "@/lib/services/bookmarks";
import { finalizeAttempt, getAttemptForUser, getResultDetail, TestError } from "@/lib/services/tests";
import type { TestAttempt } from "@/lib/types";
import { Alert, Breadcrumbs, PageHeader, PremiumLock, Stat, Table, Td, Th } from "@/components/ui/misc";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResultDonut, SubjectBars, ChartFrame } from "@/components/charts";
import { ResultSolutions, type SolutionRow } from "@/components/tests/result-solutions";
import { startMockTest } from "@/components/tests/actions";
import { formatDateTime, formatDuration } from "@/lib/utils";

export const metadata: Metadata = { title: "Test result", robots: { index: false } };

export default async function ResultPage(props: PageProps<"/tests/result/[id]">) {
  const [{ id }, sp] = await Promise.all([props.params, props.searchParams]);
  const user = await requireUser(`/tests/result/${id}`);
  let attempt: TestAttempt;
  try {
    attempt = await getAttemptForUser(id, user.id);
  } catch (err) {
    if (err instanceof TestError && err.status === 404) notFound();
    redirect("/tests/history?error=forbidden");
  }
  if (attempt.status === "in_progress") {
    // Expired attempts get graded; live ones go back to the engine.
    const graded = await finalizeAttempt(attempt);
    if (graded.status !== "submitted") redirect(`/tests/attempt/${attempt.id}`);
    attempt = graded;
  }

  const [detail, access, subjectMap, examMap, questionBookmarks] = await Promise.all([
    getResultDetail(attempt), getAccess(), getSubjectMap(), getExamMap(), bookmarkedIds(user.id, "question"),
  ]);
  const mock = attempt.mock_test_id ? await (await db()).getById("mock_tests", attempt.mock_test_id) : null;
  const exam = examMap.get(attempt.exam_id);
  const canSolutions = access.canAccess("solutions");
  const a = detail.attempt;

  const rows: SolutionRow[] = detail.questions.map((r) => ({
    id: r.question.id,
    index: r.index,
    text: r.question.text,
    options: [
      { key: "A", text: r.question.option_a }, { key: "B", text: r.question.option_b },
      { key: "C", text: r.question.option_c }, { key: "D", text: r.question.option_d },
    ],
    correct: r.question.correct_option,
    selected: r.selected,
    is_correct: r.is_correct,
    marked: r.marked_for_review,
    explanation: r.question.explanation,
    subject: subjectMap.get(r.question.subject_id)?.name ?? "Subject",
    difficulty: r.question.difficulty,
    language: r.question.language,
    time_spent_seconds: r.time_spent_seconds,
    bookmarked: questionBookmarks.has(r.question.id),
  }));

  const pace = detail.avg_seconds_per_question;
  const allotted = detail.allotted_seconds_per_question;
  const paceNote = pace === 0
    ? "No timing data recorded for this attempt."
    : pace <= allotted * 0.7
      ? `You averaged ${pace}s per question against ${allotted}s allotted — comfortably fast. Use spare time to revisit marked questions.`
      : pace <= allotted
        ? `You averaged ${pace}s per question against ${allotted}s allotted — on pace.`
        : `You averaged ${pace}s per question, above the ${allotted}s allotted. Practise skipping long questions and returning later.`;

  return (
    <div>
      <Breadcrumbs items={[{ label: "Test History", href: "/tests/history" }, { label: "Result" }]} />
      {sp.timeout === "1" && <Alert tone="warning" className="mt-4" title="Time's up">Your test was submitted automatically when the timer ran out.</Alert>}
      <PageHeader
        className="mt-4"
        eyebrow={exam?.short_name ?? "Result"}
        title={a.title}
        description={`Submitted ${formatDateTime(a.submitted_at)} · ${a.total_questions} questions · ${a.duration_minutes} min`}
        actions={
          <>
            {mock ? (
              <form action={startMockTest}>
                <input type="hidden" name="mock_test_id" value={mock.id} />
                <input type="hidden" name="slug" value={mock.slug} />
                <Button type="submit" variant="outline"><RotateCcw className="h-4 w-4" aria-hidden="true" /> Retake</Button>
              </form>
            ) : (
              <ButtonLink href="/tests/new" variant="outline"><RotateCcw className="h-4 w-4" aria-hidden="true" /> New custom test</ButtonLink>
            )}
            <ButtonLink href="/mock-tests" variant="ghost">Back to tests</ButtonLink>
            <ButtonLink href="/analytics"><BarChart3 className="h-4 w-4" aria-hidden="true" /> Analytics</ButtonLink>
          </>
        }
      />

      {/* Headline score */}
      <Card className="mt-6 overflow-hidden">
        <div className="grid gap-6 bg-gradient-to-br from-brand-800 to-brand-900 p-6 text-white sm:grid-cols-[auto_1fr] sm:items-center">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-brand-200">Your score</p>
            <p className="mt-1 text-5xl font-bold tracking-tight">{a.score}<span className="text-2xl font-semibold text-brand-200"> / {a.total_marks}</span></p>
            <p className="mt-1 text-sm text-brand-100">{a.percentage}% · accuracy {a.accuracy}%</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["Attempted", `${a.attempted}`], ["Correct", `${a.correct}`], ["Incorrect", `${a.incorrect}`], ["Time", formatDuration(a.time_taken_seconds)],
            ].map(([k, v]) => (
              <div key={k} className="rounded-xl bg-white/10 px-3 py-2.5"><p className="text-[11px] text-brand-200">{k}</p><p className="text-lg font-semibold">{v}</p></div>
            ))}
          </div>
        </div>
      </Card>

      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <Stat label="Total questions" value={a.total_questions} icon={ListChecks} tone="neutral" />
        <Stat label="Attempted" value={a.attempted} icon={HelpCircle} />
        <Stat label="Correct" value={a.correct} icon={CheckCircle2} tone="forest" />
        <Stat label="Incorrect" value={a.incorrect} icon={XCircle} tone="saffron" />
        <Stat label="Unattempted" value={a.unattempted} icon={HelpCircle} tone="neutral" />
        <Stat label="Score" value={`${a.score} / ${a.total_marks}`} icon={Trophy} />
        <Stat label="Percentage" value={`${a.percentage}%`} icon={Percent} />
        <Stat label="Accuracy" value={`${a.accuracy}%`} icon={Target} tone="forest" hint="correct ÷ attempted" />
        <Stat label="Time taken" value={formatDuration(a.time_taken_seconds)} icon={Clock} tone="neutral" hint={`of ${a.duration_minutes} min`} />
        <Stat label="Percentile" value={a.percentile !== null ? `${a.percentile}` : "—"} icon={Users} tone="saffron" hint={a.percentile !== null ? "vs other students on this test" : "Available after more students attempt"} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <ChartFrame title="Answer breakdown" description="How your responses were distributed">
          <ResultDonut correct={a.correct} incorrect={a.incorrect} unattempted={a.unattempted} />
        </ChartFrame>
        <ChartFrame title="Accuracy by subject" description="Correct answers as a share of attempted, per subject">
          <SubjectBars data={detail.subjects.map((s) => ({ label: subjectMap.get(s.subject_id)?.name ?? s.subject_id, value: s.accuracy }))} />
        </ChartFrame>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <div>
            <CardTitle>Subject-wise performance</CardTitle>
            <CardDescription>{paceNote}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <thead><tr><Th>Subject</Th><Th className="text-right">Questions</Th><Th className="text-right">Attempted</Th><Th className="text-right">Correct</Th><Th className="text-right">Incorrect</Th><Th className="text-right">Accuracy</Th><Th className="text-right">Score %</Th></tr></thead>
            <tbody>
              {detail.subjects.map((s) => (
                <tr key={s.subject_id}>
                  <Td className="font-medium text-ink-900">{subjectMap.get(s.subject_id)?.name ?? s.subject_id}</Td>
                  <Td className="text-right">{s.total}</Td><Td className="text-right">{s.attempted}</Td>
                  <Td className="text-right text-forest-700">{s.correct}</Td><Td className="text-right text-red-700">{s.incorrect}</Td>
                  <Td className="text-right font-medium">{s.accuracy}%</Td><Td className="text-right">{s.score_pct}%</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </CardContent>
      </Card>

      <section className="mt-8" id="solutions">
        <h2 className="text-xl font-bold tracking-tight text-ink-900">Detailed solutions</h2>
        <p className="mt-1 text-sm text-ink-500">Every question with the correct answer, your response and an explanation. Bookmark tricky ones for revision.</p>
        <div className="mt-4">
          {canSolutions ? (
            <ResultSolutions rows={rows} showBookmarks />
          ) : (
            <PremiumLock title="Detailed solutions are a Premium feature" description="See the correct answer and a step-by-step explanation for every question, and bookmark them for revision." />
          )}
        </div>
      </section>
      <p className="mt-6 text-center text-xs text-ink-500"><Link href="/tests/history" className="text-brand-700 hover:underline">View all attempts</Link></p>
    </div>
  );
}
