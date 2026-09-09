import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AlertTriangle, Clock, FileQuestion, ListChecks, Lock, Play, RotateCcw, Trophy, Users } from "lucide-react";
import { getSessionUser } from "@/lib/auth/session";
import { getAccess } from "@/lib/access";
import { getExamMap, getMockTestBySlug, getSubjectMap } from "@/lib/services/catalog";
import { bookmarkedIds } from "@/lib/services/bookmarks";
import { canAttemptMock } from "@/lib/services/test-access";
import { createAttemptFromMock, getMockTestQuestions, getUserAttempts, isExpired, subjectBreakdown } from "@/lib/services/tests";
import { Badge, FreeBadge, PremiumBadge, difficultyTone } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, Breadcrumbs, Container, PremiumLock, Table, Td, Th } from "@/components/ui/misc";
import { BookmarkButton } from "@/components/bookmarks/bookmark-button";
import { startMockTest } from "@/components/tests/actions";
import { DIFFICULTY_LABELS, formatDate, formatDuration, formatNumber } from "@/lib/utils";

export async function generateMetadata(props: PageProps<"/mock-tests/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const test = await getMockTestBySlug(slug);
  if (!test) return { title: "Mock test not found" };
  return {
    title: `${test.title} – Online Mock Test`,
    description: `${test.question_count} questions · ${test.duration_minutes} minutes · ${test.total_marks} marks. ${test.description}`.slice(0, 160),
    alternates: { canonical: `/mock-tests/${test.slug}` },
  };
}

export default async function MockTestDetailPage(props: PageProps<"/mock-tests/[slug]">) {
  const [{ slug }, sp] = await Promise.all([props.params, props.searchParams]);
  const test = await getMockTestBySlug(slug);
  if (!test || !test.is_published) notFound();

  const [user, examMap, subjectMap, questions] = await Promise.all([getSessionUser(), getExamMap(), getSubjectMap(), getMockTestQuestions(test.id)]);
  const exam = examMap.get(test.exam_id);
  const subject = test.subject_id ? subjectMap.get(test.subject_id) : null;
  const gate = await canAttemptMock(user, test);
  const access = user ? await getAccess() : null;

  // One-click start from list cards (?start=1). Idempotent: resumes an in-progress attempt.
  if (sp.start === "1" && user && gate.ok) {
    const attempt = await createAttemptFromMock(user.id, test);
    redirect(`/tests/attempt/${attempt.id}`);
  }

  const attempts = user ? await getUserAttempts(user.id, { mockTestId: test.id }) : [];
  const inProgress = attempts.find((a) => a.status === "in_progress" && !isExpired(a)) ?? null;
  const submitted = attempts.filter((a) => a.status === "submitted");
  const bookmarked = user ? (await bookmarkedIds(user.id, "mock_test")).has(test.id) : false;
  const breakdown = subjectBreakdown(questions);

  return (
    <Container className="py-8 lg:py-10">
      <Breadcrumbs items={[{ label: "Mock Tests", href: "/mock-tests" }, ...(exam ? [{ label: exam.short_name, href: `/exams/${exam.slug}` }] : []), { label: test.title }]} />
      <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            {test.is_premium ? <PremiumBadge locked={!gate.ok && gate.reason === "premium"} /> : <FreeBadge />}
            {test.is_pyp && <Badge tone="brand">Previous Year Paper</Badge>}
            <Badge tone={difficultyTone(test.difficulty)}>{DIFFICULTY_LABELS[test.difficulty]}</Badge>
            {subject ? <Badge tone="outline">{subject.name}</Badge> : <Badge tone="outline">Full length</Badge>}
          </div>
          <div className="mt-3 flex items-start justify-between gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">{test.title}</h1>
            {user && <BookmarkButton type="mock_test" itemId={test.id} initial={bookmarked} />}
          </div>
          <p className="mt-2 text-sm text-ink-500">{exam?.name ?? "Uttarakhand government exam"} · conducted by {exam?.conducting_body ?? "—"}</p>
          <p className="mt-4 text-base text-ink-700">{test.description}</p>

          <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              [FileQuestion, "Questions", String(test.question_count)],
              [Clock, "Duration", `${test.duration_minutes} min`],
              [Trophy, "Total marks", String(test.total_marks)],
              [Users, "Attempts", formatNumber(test.attempts_count)],
            ].map(([Icon, label, value]) => {
              const I = Icon as typeof Clock;
              return (
                <div key={label as string} className="rounded-xl border border-ink-200 bg-white p-3.5">
                  <dt className="flex items-center gap-1.5 text-xs text-ink-500"><I className="h-3.5 w-3.5" aria-hidden="true" /> {label as string}</dt>
                  <dd className="mt-1 text-lg font-semibold text-ink-900">{value as string}</dd>
                </div>
              );
            })}
          </dl>

          {sp.locked === "1" && !gate.ok && (
            <Alert tone="warning" title="Premium test" className="mt-6">This test is part of Premium. Start your subscription to attempt it.</Alert>
          )}

          <Card className="mt-8">
            <CardHeader><CardTitle className="flex items-center gap-2"><ListChecks className="h-4 w-4 text-brand-700" aria-hidden="true" /> Instructions</CardTitle></CardHeader>
            <CardContent>
              <ul className="prose-dp list-disc space-y-1.5 pl-5 text-sm text-ink-700">
                <li>The test has <strong>{test.question_count} multiple-choice questions</strong> to be completed in <strong>{test.duration_minutes} minutes</strong>. The timer starts when you click Start and keeps running even if you close the tab.</li>
                <li>Each correct answer earns the marks shown for the question (usually 1). <strong>{test.negative_marks > 0 ? `${test.negative_marks} mark is deducted` : "No marks are deducted"}</strong> for every wrong answer. Unattempted questions score 0.</li>
                <li>Use the question palette to jump between questions, mark questions for review, and clear a response. Answers are saved automatically.</li>
                <li>The test submits automatically when time runs out. You can submit early once you are done.</li>
                <li>Detailed solutions and subject-wise analysis are shown immediately after submission{access && !access.canAccess("solutions") ? " (solutions require Premium)" : ""}.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mt-5">
            <CardHeader><CardTitle>Marking scheme &amp; subject breakdown</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <thead><tr><Th>Subject</Th><Th className="text-right">Questions</Th><Th className="text-right">Marks</Th><Th className="text-right">Negative</Th></tr></thead>
                <tbody>
                  {breakdown.map((b) => (
                    <tr key={b.subject_id}>
                      <Td className="font-medium text-ink-900">{subjectMap.get(b.subject_id)?.name ?? b.subject_id}</Td>
                      <Td className="text-right">{b.count}</Td>
                      <Td className="text-right">{b.count}</Td>
                      <Td className="text-right">−{test.negative_marks} each</Td>
                    </tr>
                  ))}
                  <tr className="bg-ink-50 font-semibold">
                    <Td className="text-ink-900">Total</Td><Td className="text-right">{test.question_count}</Td><Td className="text-right">{test.total_marks}</Td><Td />
                  </tr>
                </tbody>
              </Table>
            </CardContent>
          </Card>

          {user && submitted.length > 0 && (
            <Card className="mt-5">
              <CardHeader><CardTitle>Your previous attempts</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <thead><tr><Th>Date</Th><Th className="text-right">Score</Th><Th className="text-right">Percentage</Th><Th className="text-right">Accuracy</Th><Th className="text-right">Time</Th><Th /></tr></thead>
                  <tbody>
                    {submitted.map((a) => (
                      <tr key={a.id}>
                        <Td>{formatDate(a.submitted_at)}</Td>
                        <Td className="text-right font-medium text-ink-900">{a.score} / {a.total_marks}</Td>
                        <Td className="text-right">{a.percentage}%</Td>
                        <Td className="text-right">{a.accuracy}%</Td>
                        <Td className="text-right">{formatDuration(a.time_taken_seconds)}</Td>
                        <Td className="text-right"><Link href={`/tests/result/${a.id}`} className="font-medium text-brand-700 hover:underline">Review</Link></Td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Card>
            <CardContent className="pt-5">
              {!user ? (
                <>
                  <p className="text-sm text-ink-700">Log in to attempt this test. New students get a 30-day free trial with premium tests included.</p>
                  <ButtonLink href={`/login?next=${encodeURIComponent(`/mock-tests/${test.slug}`)}`} className="mt-4 w-full"><Play className="h-4 w-4" aria-hidden="true" /> Log in to start</ButtonLink>
                  <ButtonLink href="/signup" variant="outline" className="mt-2 w-full">Start 30 Days Free Trial</ButtonLink>
                </>
              ) : !gate.ok ? (
                <PremiumLock compact title="Premium mock test" description="Unlock unlimited mock tests, detailed solutions and analytics." className="border-0 bg-transparent px-0 py-0" />
              ) : (
                <>
                  {inProgress ? (
                    <>
                      <Alert tone="info" className="mb-3"><span className="flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" /> You have an attempt in progress.</span></Alert>
                      <ButtonLink href={`/tests/attempt/${inProgress.id}`} className="w-full"><Play className="h-4 w-4" aria-hidden="true" /> Resume test</ButtonLink>
                    </>
                  ) : (
                    <form action={startMockTest}>
                      <input type="hidden" name="mock_test_id" value={test.id} />
                      <input type="hidden" name="slug" value={test.slug} />
                      <Button type="submit" className="w-full" size="lg">
                        {submitted.length ? <><RotateCcw className="h-4 w-4" aria-hidden="true" /> Retake test</> : <><Play className="h-4 w-4" aria-hidden="true" /> Start test</>}
                      </Button>
                    </form>
                  )}
                  <p className="mt-3 text-center text-xs text-ink-500">{test.duration_minutes} minutes · {test.question_count} questions · auto-submit on timeout</p>
                </>
              )}
            </CardContent>
          </Card>
          {exam && (
            <Card className="mt-4">
              <CardContent className="pt-5 text-sm">
                <p className="font-semibold text-ink-900">Preparing for {exam.short_name}?</p>
                <p className="mt-1 text-ink-500">Syllabus, pattern, notes and previous-year papers in one place.</p>
                <ButtonLink href={`/exams/${exam.slug}`} variant="secondary" size="sm" className="mt-3 w-full">Go to exam page</ButtonLink>
              </CardContent>
            </Card>
          )}
          {!gate.ok && gate.reason === "premium" && (
            <p className="mt-3 flex items-center justify-center gap-1 text-xs text-ink-500"><Lock className="h-3 w-3" aria-hidden="true" /> Server-verified access — content is never sent to locked users.</p>
          )}
        </aside>
      </div>
    </Container>
  );
}
