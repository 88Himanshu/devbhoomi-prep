import { db } from "@/lib/data";
import { getExams } from "@/lib/services/catalog";
import { JsonLd, breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { Container, PageHeader } from "@/components/ui/misc";
import { ExamCard } from "@/components/exams/exam-card";

export const metadata = pageMetadata({
  title: "Uttarakhand Government Exams – UKPSC, UKSSSC, Police, Patwari & more",
  description: "Browse every Uttarakhand competitive exam we cover: overview, eligibility, syllabus, exam pattern, books, notes, previous-year papers and mock tests.",
  path: "/exams",
});

export default async function ExamsPage() {
  const [exams, store] = await Promise.all([getExams(), db()]);
  const [mocks, papers] = await Promise.all([
    store.select("mock_tests", { eq: { is_published: true } }),
    store.select("previous_year_papers", { eq: { is_published: true } }),
  ]);
  const count = (rows: { exam_id: string }[], id: string) => rows.filter((r) => r.exam_id === id).length;
  const groups = new Map<string, typeof exams>();
  for (const e of exams) groups.set(e.category, [...(groups.get(e.category) ?? []), e]);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Exams", path: "/exams" }])} />
      <div className="border-b border-ink-200 bg-gradient-to-b from-brand-50 to-white">
        <Container className="py-12 sm:py-16">
          <PageHeader eyebrow="Exam categories" title="Uttarakhand competitive exams" description="Pick an exam to see its eligibility, syllabus, pattern, study plan and all matching books, notes, papers and mock tests." />
        </Container>
      </div>
      <Container className="space-y-12 py-12">
        {[...groups.entries()].map(([category, list]) => (
          <section key={category} aria-labelledby={`cat-${category}`}>
            <h2 id={`cat-${category}`} className="mb-4 text-lg font-semibold text-ink-900">{category}</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((exam) => (
                <ExamCard key={exam.id} exam={exam} mocks={count(mocks, exam.id)} papers={count(papers, exam.id)} />
              ))}
            </div>
          </section>
        ))}
      </Container>
    </>
  );
}
