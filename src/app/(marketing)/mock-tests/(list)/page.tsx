import type { Metadata } from "next";
import { Suspense } from "react";
import { ClipboardList, Sparkles } from "lucide-react";
import { getSessionUser } from "@/lib/auth/session";
import { getAccess } from "@/lib/access";
import { getExams, getSubjects, listMockTests } from "@/lib/services/catalog";
import { bestScoresByMock } from "@/lib/services/tests";
import { Container, EmptyState, PageHeader } from "@/components/ui/misc";
import { ButtonLink } from "@/components/ui/button";
import { MockTestCard } from "@/components/tests/mock-test-card";
import { MockTestFilters } from "@/components/tests/mock-test-filters";

export const metadata: Metadata = {
  title: "Mock Tests for Uttarakhand Government Exams",
  description: "Timed online mock tests for UKPSC, UKSSSC, Uttarakhand Police, Patwari, VDO, Forest Guard and more, with detailed solutions and performance analytics.",
  alternates: { canonical: "/mock-tests" },
};

export default async function MockTestsPage(props: PageProps<"/mock-tests">) {
  const sp = await props.searchParams;
  const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
  const q = str(sp.q), exam = str(sp.exam), subject = str(sp.subject), difficulty = str(sp.difficulty), accessFilter = str(sp.access);

  const [user, exams, subjects] = await Promise.all([getSessionUser(), getExams(), getSubjects()]);
  const access = user ? await getAccess() : null;
  const canPremium = Boolean(access?.canAccess("mock_tests"));

  let tests = await listMockTests({
    q: q || undefined,
    examId: exam || undefined,
    subjectId: subject && subject !== "full" ? subject : undefined,
    difficulty: difficulty || undefined,
    premium: accessFilter === "free" ? false : accessFilter === "premium" ? true : undefined,
  });
  if (subject === "full") tests = tests.filter((t) => t.subject_id === null);
  const best = user ? await bestScoresByMock(user.id) : new Map();
  const examMap = new Map(exams.map((e) => [e.id, e]));
  const subjectMap = new Map(subjects.map((s) => [s.id, s]));

  return (
    <Container className="py-10">
      <PageHeader
        eyebrow="Practice"
        title="Mock Tests"
        description="Exam-pattern tests with a real CBT interface, negative marking, instant results and detailed solutions."
        actions={<ButtonLink href="/tests/new" variant="forest"><Sparkles className="h-4 w-4" aria-hidden="true" /> Build a custom test</ButtonLink>}
      />
      <div className="mt-6">
        <Suspense>
          <MockTestFilters exams={exams.map((e) => ({ id: e.id, name: e.short_name }))} subjects={subjects.map((s) => ({ id: s.id, name: s.name }))} />
        </Suspense>
      </div>
      <p className="mt-5 text-sm text-ink-500">{tests.length} {tests.length === 1 ? "test" : "tests"}{q ? ` matching “${q}”` : ""}</p>
      {tests.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No tests match these filters" description="Try another exam or subject, or build a custom test from the question bank." className="mt-4" action={<ButtonLink href="/tests/new" variant="outline" size="sm">Build a custom test</ButtonLink>} />
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col justify-between rounded-card border border-dashed border-forest-300 bg-forest-50/60 p-5">
            <div>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-forest-700 shadow-card"><Sparkles className="h-5 w-5" aria-hidden="true" /></span>
              <h3 className="mt-3 text-base font-semibold text-ink-900">Build a custom test</h3>
              <p className="mt-1 text-sm text-ink-700">Pick an exam, subject, difficulty and number of questions. We assemble a fresh test from the question bank every time.</p>
            </div>
            <ButtonLink href="/tests/new" variant="forest" size="sm" className="mt-4">{user ? "Create test" : "Log in to create"}</ButtonLink>
          </div>
          {tests.map((t) => (
            <MockTestCard key={t.id} test={t} exam={examMap.get(t.exam_id)} subject={t.subject_id ? subjectMap.get(t.subject_id) : null} locked={t.is_premium && !canPremium} best={best.get(t.id) ?? null} />
          ))}
        </div>
      )}
    </Container>
  );
}
