import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import { getExams, getSubjects, listMockTests } from "@/lib/services/catalog";
import { Container, PageHeader } from "@/components/ui/misc";
import { ButtonLink } from "@/components/ui/button";
import { StaticMockTests } from "@/components/static/static-mock-tests";

export const metadata: Metadata = {
  title: "Mock Tests for Uttarakhand Government Exams",
  description: "Timed online mock tests for UKPSC, UKSSSC, Uttarakhand Police, Patwari, VDO, Forest Guard and more, with detailed solutions and performance analytics.",
  alternates: { canonical: "/mock-tests" },
};

export default async function Page() {
  const [tests, exams, subjects] = await Promise.all([listMockTests(), getExams(), getSubjects()]);
  return (
    <Container className="py-10">
      <PageHeader
        eyebrow="Practice"
        title="Mock Tests"
        description="Exam-pattern tests with a real CBT interface, negative marking, instant results and detailed solutions."
        actions={<ButtonLink href="/tests/new" variant="forest"><Sparkles className="h-4 w-4" aria-hidden="true" /> Build a custom test</ButtonLink>}
      />
      <StaticMockTests tests={tests} exams={exams} subjects={subjects} />
    </Container>
  );
}
