import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/session";
import { getAccess } from "@/lib/access";
import { db } from "@/lib/data";
import { getExams, getSubjects } from "@/lib/services/catalog";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader, PremiumLock } from "@/components/ui/misc";
import { CustomTestBuilder } from "@/components/tests/custom-builder";

export const metadata: Metadata = { title: "Build a custom test", robots: { index: false } };

export default async function NewTestPage() {
  const user = await requireUser("/tests/new");
  const [access, exams, subjects, profile] = await Promise.all([getAccess(), getExams(), getSubjects(), (await db()).getById("profiles", user.id)]);
  const defaultExam = exams.find((e) => e.id === profile?.preferred_exam_id)?.id ?? exams[0]?.id ?? "";

  return (
    <div>
      <PageHeader eyebrow="Practice" title="Build a custom test" description="Assemble a fresh timed test from the question bank. Every run picks a new set of questions." />
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardContent className="pt-6">
            {access.canAccess("mock_tests") ? (
              <CustomTestBuilder exams={exams.map((e) => ({ id: e.id, name: e.name }))} subjects={subjects.map((s) => ({ id: s.id, name: s.name }))} defaultExamId={defaultExam} />
            ) : (
              <PremiumLock title="Custom tests are a Premium feature" description="Unlimited custom tests, detailed solutions and analytics come with any plan. Free mock tests remain open." />
            )}
          </CardContent>
        </Card>
        <div className="grid gap-4 self-start">
          <Card><CardContent className="pt-5 text-sm text-ink-700">
            <p className="font-semibold text-ink-900">How it works</p>
            <ol className="mt-2 list-decimal space-y-1.5 pl-5">
              <li>Questions are drawn from the exam&apos;s bank plus general questions for the subject.</li>
              <li>Duration is 1.2 minutes per question, matching the pace of most Uttarakhand papers.</li>
              <li>Negative marking follows each question (usually −0.25; none for pedagogy).</li>
              <li>Results, solutions and analytics work exactly like a mock test.</li>
            </ol>
          </CardContent></Card>
          <Card><CardContent className="pt-5 text-sm text-ink-700">
            <p className="font-semibold text-ink-900">Tip</p>
            <p className="mt-1">Check your <a href="/analytics" className="text-brand-700 underline">weak subjects</a> first, then build a 20-question hard test on one of them.</p>
          </CardContent></Card>
        </div>
      </div>
    </div>
  );
}
