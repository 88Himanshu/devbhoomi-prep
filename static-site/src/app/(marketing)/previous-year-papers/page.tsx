import type { Metadata } from "next";
import { db } from "@/lib/data";
import { getExams, getSubjects, listPapers } from "@/lib/services/catalog";
import { fileUrl } from "@/lib/storage";
import { Container, PageHeader } from "@/components/ui/misc";
import { ButtonLink } from "@/components/ui/button";
import { StaticPapers, type StaticPaper } from "@/components/static/static-papers";

export const metadata: Metadata = {
  title: "Previous Year Question Papers – Uttarakhand Exams",
  description: "Download and practise previous-year papers for UKPSC, UKSSSC, Uttarakhand Police, Patwari, VDO, Forest Guard and more. Filter by exam, year, subject and paper type.",
  alternates: { canonical: "/previous-year-papers" },
};

export default async function Page() {
  const [papers, exams, subjects] = await Promise.all([listPapers(), getExams(), getSubjects()]);
  const mockIds = papers.map((p) => p.mock_test_id).filter(Boolean) as string[];
  const mocks = mockIds.length ? await (await db()).select("mock_tests", { in: { id: mockIds }, eq: { is_published: true } }) : [];
  const mockSlug = new Map(mocks.map((m) => [m.id, m.slug]));
  const rows: StaticPaper[] = papers.map((p) => ({
    ...p,
    viewUrl: p.file_path ? fileUrl(p.file_path) : null,
    mockSlug: p.mock_test_id ? mockSlug.get(p.mock_test_id) ?? null : null,
  }));
  const years = [...new Set(papers.map((p) => p.year))].sort((a, b) => b - a);
  return (
    <Container className="py-8 sm:py-10">
      <PageHeader
        eyebrow="Practice with real papers"
        title="Previous Year Papers"
        description="Official-pattern question papers from past years. View or download the PDF, or attempt the paper as a timed mock test with solutions on the full platform."
        actions={<ButtonLink href="/mock-tests" variant="outline" size="sm">Browse mock tests</ButtonLink>}
      />
      <StaticPapers papers={rows} exams={exams} subjects={subjects} years={years} />
    </Container>
  );
}
