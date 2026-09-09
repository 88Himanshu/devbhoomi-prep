import type { Metadata } from "next";
import Link from "next/link";
import { FileText } from "lucide-react";
import { getSessionUser } from "@/lib/auth/session";
import { getAccess } from "@/lib/access";
import { db } from "@/lib/data";
import { getExams, getSubjects, listPapers } from "@/lib/services/catalog";
import { paperYears } from "@/lib/services/materials";
import type { MockTest } from "@/lib/types";
import { cn, PAPER_TYPE_LABELS } from "@/lib/utils";
import { Container, EmptyState, PageHeader } from "@/components/ui/misc";
import { ButtonLink } from "@/components/ui/button";
import { FilterBar } from "@/components/library/filter-bar";
import { PaperCard } from "@/components/library/papers-list";

export const metadata: Metadata = {
  title: "Previous Year Question Papers – Uttarakhand Exams",
  description: "Download and practise previous-year papers for UKPSC, UKSSSC, Uttarakhand Police, Patwari, VDO, Forest Guard and more. Filter by exam, year, subject and paper type, or attempt them as timed mock tests.",
  alternates: { canonical: "/previous-year-papers" },
};

const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;

export default async function Page(props: PageProps<"/previous-year-papers">) {
  const sp = await props.searchParams;
  const q = str(sp.q), examId = str(sp.exam), year = str(sp.year), subjectId = str(sp.subject), paperType = str(sp.type);

  const [user, access, exams, subjects, years] = await Promise.all([getSessionUser(), getAccess(), getExams(), getSubjects(), paperYears()]);
  const papers = await listPapers({ q, examId, subjectId, paperType, year: year ? Number(year) : undefined });
  const mockIds = papers.map((p) => p.mock_test_id).filter(Boolean) as string[];
  const mocks = mockIds.length ? await (await db()).select("mock_tests", { in: { id: mockIds }, eq: { is_published: true } }) : [];
  const mockMap = new Map<string, MockTest>(mocks.map((m) => [m.id, m]));
  const examMap = new Map(exams.map((e) => [e.id, e]));
  const subjectMap = new Map(subjects.map((s) => [s.id, s]));

  const yearHref = (y?: number) => {
    const p = new URLSearchParams();
    if (q) p.set("q", q); if (examId) p.set("exam", examId); if (subjectId) p.set("subject", subjectId); if (paperType) p.set("type", paperType);
    if (y) p.set("year", String(y));
    return `/previous-year-papers${p.toString() ? `?${p}` : ""}`;
  };

  // Group by exam, preserving exam sort order
  const groups = exams.map((e) => ({ exam: e, papers: papers.filter((p) => p.exam_id === e.id) })).filter((g) => g.papers.length);
  const orphan = papers.filter((p) => !examMap.has(p.exam_id));

  return (
    <Container className="py-8 sm:py-10">
      <PageHeader
        eyebrow="Practice with real papers"
        title="Previous Year Papers"
        description="Official-pattern question papers from past years. View or download the PDF, or attempt the paper as a timed mock test with solutions."
        actions={<ButtonLink href="/mock-tests" variant="outline" size="sm">Browse mock tests</ButtonLink>}
      />

      <div className="mt-6">
        <FilterBar
          basePath="/previous-year-papers"
          q={q}
          placeholder="Search papers by title…"
          filters={[
            { name: "exam", label: "Exams", options: exams.map((e) => ({ value: e.id, label: e.short_name })), value: examId },
            { name: "year", label: "Years", options: years.map((y) => ({ value: String(y), label: String(y) })), value: year },
            { name: "subject", label: "Subjects", options: subjects.map((s) => ({ value: s.id, label: s.name })), value: subjectId },
            { name: "type", label: "Paper types", options: Object.entries(PAPER_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l })), value: paperType },
          ]}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-1.5" aria-label="Filter by year">
        <Link href={yearHref()} className={cn("rounded-full border px-3 py-1 text-xs font-medium", !year ? "border-brand-700 bg-brand-700 text-white" : "border-ink-200 text-ink-700 hover:border-brand-300")}>All years</Link>
        {years.map((y) => (
          <Link key={y} href={yearHref(y)} className={cn("rounded-full border px-3 py-1 text-xs font-medium", year === String(y) ? "border-brand-700 bg-brand-700 text-white" : "border-ink-200 text-ink-700 hover:border-brand-300")}>{y}</Link>
        ))}
      </div>

      <p className="mt-5 text-sm text-ink-500"><span className="font-semibold text-ink-900">{papers.length}</span> {papers.length === 1 ? "paper" : "papers"}{q && <> for “{q}”</>}</p>

      {papers.length === 0 ? (
        <EmptyState className="mt-6" icon={FileText} title="No papers match these filters" description="Try another exam or year." action={<ButtonLink href="/previous-year-papers" variant="outline" size="sm">Clear filters</ButtonLink>} />
      ) : (
        <div className="mt-4 space-y-10">
          {groups.map(({ exam, papers: list }) => (
            <section key={exam.id}>
              <div className="mb-3 flex items-end justify-between gap-3">
                <h2 className="text-lg font-semibold text-ink-900">{exam.name} <span className="text-sm font-normal text-ink-500">· {list.length}</span></h2>
                <Link href={`/exams/${exam.slug}`} className="text-sm font-medium text-brand-700 hover:underline">Exam page →</Link>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {list.map((p) => (
                  <PaperCard key={p.id} paper={p} exam={exam} subject={p.subject_id ? subjectMap.get(p.subject_id) : undefined} mockTest={p.mock_test_id ? mockMap.get(p.mock_test_id) ?? null : null} access={access} user={Boolean(user)} />
                ))}
              </div>
            </section>
          ))}
          {orphan.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {orphan.map((p) => <PaperCard key={p.id} paper={p} access={access} user={Boolean(user)} mockTest={p.mock_test_id ? mockMap.get(p.mock_test_id) ?? null : null} />)}
            </div>
          )}
        </div>
      )}

      <p className="mt-10 rounded-xl bg-ink-50 px-4 py-3 text-center text-xs text-ink-500">
        Question papers are reproduced from publicly released examination material or reconstructed from memory-based sources for practice. Answer keys are prepared by the Devbhoomi Prep team.
      </p>
    </Container>
  );
}
