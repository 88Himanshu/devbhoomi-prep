import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Clock, FileQuestion, ListChecks, Play, Trophy, Users } from "lucide-react";
import { db } from "@/lib/data";
import { getExamMap, getMockTestBySlug, getSubjectMap } from "@/lib/services/catalog";
import { getMockTestQuestions, subjectBreakdown } from "@/lib/services/tests";
import { Badge, FreeBadge, PremiumBadge, difficultyTone } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumbs, Container, Table, Td, Th } from "@/components/ui/misc";
import { DIFFICULTY_LABELS, formatNumber } from "@/lib/utils";

export async function generateStaticParams() {
  const rows = await (await db()).select("mock_tests", { eq: { is_published: true } });
  return rows.map((r) => ({ slug: r.slug }));
}

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

/** Static showcase: test overview only; attempts run on the full platform. */
export default async function MockTestDetailPage(props: PageProps<"/mock-tests/[slug]">) {
  const { slug } = await props.params;
  const test = await getMockTestBySlug(slug);
  if (!test || !test.is_published) notFound();
  const [examMap, subjectMap, questions] = await Promise.all([getExamMap(), getSubjectMap(), getMockTestQuestions(test.id)]);
  const exam = examMap.get(test.exam_id);
  const subject = test.subject_id ? subjectMap.get(test.subject_id) : null;
  const breakdown = subjectBreakdown(questions);

  return (
    <Container className="py-8 lg:py-10">
      <Breadcrumbs items={[{ label: "Mock Tests", href: "/mock-tests" }, ...(exam ? [{ label: exam.short_name, href: `/exams/${exam.slug}` }] : []), { label: test.title }]} />
      <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            {test.is_premium ? <PremiumBadge locked /> : <FreeBadge />}
            {test.is_pyp && <Badge tone="brand">Previous Year Paper</Badge>}
            <Badge tone={difficultyTone(test.difficulty)}>{DIFFICULTY_LABELS[test.difficulty]}</Badge>
            {subject ? <Badge tone="outline">{subject.name}</Badge> : <Badge tone="outline">Full length</Badge>}
          </div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">{test.title}</h1>
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

          <Card className="mt-8">
            <CardHeader><CardTitle className="flex items-center gap-2"><ListChecks className="h-4 w-4 text-brand-700" aria-hidden="true" /> Instructions</CardTitle></CardHeader>
            <CardContent>
              <ul className="prose-dp list-disc space-y-1.5 pl-5 text-sm text-ink-700">
                <li>The test has <strong>{test.question_count} multiple-choice questions</strong> to be completed in <strong>{test.duration_minutes} minutes</strong>. The timer keeps running even if you close the tab.</li>
                <li>Each correct answer earns the marks shown for the question (usually 1). <strong>{test.negative_marks > 0 ? `${test.negative_marks} mark is deducted` : "No marks are deducted"}</strong> for every wrong answer. Unattempted questions score 0.</li>
                <li>Use the question palette to jump between questions, mark questions for review, and clear a response. Answers are saved automatically.</li>
                <li>The test submits automatically when time runs out. Detailed solutions and subject-wise analysis are shown immediately after submission.</li>
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
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Card>
            <CardContent className="pt-5">
              <p className="text-sm font-semibold text-ink-900">Attempt this test on the full platform</p>
              <p className="mt-1 text-sm text-ink-700">Timed CBT interface, question palette, auto-save, instant grading, detailed solutions and analytics. New students get a 30-day free trial.</p>
              <ButtonLink href="/signup" className="mt-4 w-full" size="lg"><Play className="h-4 w-4" aria-hidden="true" /> Start on the full platform</ButtonLink>
              <p className="mt-3 text-center text-xs text-ink-500">{test.duration_minutes} minutes · {test.question_count} questions · auto-submit on timeout</p>
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
        </aside>
      </div>
    </Container>
  );
}
