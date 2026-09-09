import type { Metadata } from "next";
import { db } from "@/lib/data";
import { getExams, getSubjects } from "@/lib/services/catalog";
import { Container, PageHeader } from "@/components/ui/misc";
import { StaticSearch, type SearchData } from "@/components/static/static-search";

export const metadata: Metadata = { title: "Search", robots: { index: false } };

/** Static showcase: search runs in the browser over a compact, answer-free index built at export time. */
export default async function Page() {
  const store = await db();
  const [exams, subjects, books, notes, papers, mockTests, questions] = await Promise.all([
    getExams(), getSubjects(),
    store.select("books", { eq: { is_published: true } }),
    store.select("notes", { eq: { is_published: true } }),
    store.select("previous_year_papers", { eq: { is_published: true } }),
    store.select("mock_tests", { eq: { is_published: true } }),
    store.select("questions", { eq: { is_active: true } }),
  ]);
  const material = (m: (typeof books)[number]) => ({ id: m.id, slug: m.slug, title: m.title, description: m.description, author: m.author, subject_id: m.subject_id, language: m.language, pages: m.pages, is_premium: m.is_premium, cover_color: m.cover_color });
  const data: SearchData = {
    exams: exams.map((e) => ({ id: e.id, slug: e.slug, name: e.name, short_name: e.short_name, conducting_body: e.conducting_body, category: e.category, tagline: e.tagline })),
    books: books.map(material),
    notes: notes.map(material),
    papers: papers.map((p) => ({ id: p.id, title: p.title, exam_id: p.exam_id, year: p.year, paper_type: p.paper_type, total_questions: p.total_questions, is_premium: p.is_premium })),
    mockTests: mockTests.map((m) => ({ id: m.id, slug: m.slug, title: m.title, description: m.description, exam_id: m.exam_id, question_count: m.question_count, duration_minutes: m.duration_minutes, difficulty: m.difficulty, is_premium: m.is_premium })),
    questions: questions.map((q) => ({ id: q.id, text: q.text, option_a: q.option_a, option_b: q.option_b, option_c: q.option_c, option_d: q.option_d, subject_id: q.subject_id, exam_id: q.exam_id, year: q.year, difficulty: q.difficulty, language: q.language })),
    subjectNames: Object.fromEntries(subjects.map((s) => [s.id, s.name])),
    examNames: Object.fromEntries(exams.map((e) => [e.id, e.short_name])),
  };
  return (
    <Container className="max-w-5xl py-8 sm:py-10">
      <PageHeader eyebrow="Global search" title="Search" description="Find exams, books, notes, previous-year papers, mock tests and questions." />
      <StaticSearch data={data} />
    </Container>
  );
}
