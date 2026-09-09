import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarDays, CheckCircle2, ChevronDown, ClipboardCheck, FileText, Landmark } from "lucide-react";
import { db } from "@/lib/data";
import { getAccess } from "@/lib/access";
import { getSessionUser } from "@/lib/auth/session";
import { getExamBySlug, getExamMap, getSubjectMap, listMaterials, listMockTests, listPapers } from "@/lib/services/catalog";
import { JsonLd, breadcrumbJsonLd, courseJsonLd, pageMetadata } from "@/lib/seo";
import { Breadcrumbs, Container, EmptyState } from "@/components/ui/misc";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExamIcon } from "@/components/exams/exam-icon";
import { ExamNav } from "@/components/exams/exam-nav";
import { ImportantQuestions } from "@/components/exams/important-questions";
import { MaterialCard, MockTestCard, PaperCard } from "@/components/marketing/catalog-cards";

export async function generateMetadata({ params }: PageProps<"/exams/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const exam = await getExamBySlug(slug);
  if (!exam) return { title: "Exam not found" };
  return pageMetadata({
    title: `${exam.name} – Syllabus, Eligibility, Pattern, Books & Mock Tests`,
    description: `${exam.tagline} Complete ${exam.short_name} preparation: eligibility, syllabus, exam pattern, study plan, notes, previous-year papers and mock tests.`,
    path: `/exams/${exam.slug}`,
  });
}

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "eligibility", label: "Eligibility" },
  { id: "syllabus", label: "Syllabus" },
  { id: "pattern", label: "Exam Pattern" },
  { id: "books", label: "Books" },
  { id: "notes", label: "Notes" },
  { id: "papers", label: "Previous Papers" },
  { id: "mock-tests", label: "Mock Tests" },
  { id: "important-questions", label: "Important Questions" },
  { id: "study-plan", label: "Study Plan" },
];

export default async function ExamPage({ params }: PageProps<"/exams/[slug]">) {
  const { slug } = await params;
  const exam = await getExamBySlug(slug);
  if (!exam || !exam.is_active) notFound();

  const [user, access, subjectMap, examMap, books, notes, papers, tests, store] = await Promise.all([
    getSessionUser(), getAccess(), getSubjectMap(), getExamMap(),
    listMaterials("book", { examId: exam.id, limit: 6 }),
    listMaterials("note", { examId: exam.id, limit: 6 }),
    listPapers({ examId: exam.id, limit: 6 }),
    listMockTests({ examId: exam.id, limit: 6 }),
    db(),
  ]);
  const importantAll = exam.important_question_ids.length
    ? await store.select("questions", { in: { id: exam.important_question_ids }, eq: { is_active: true } })
    : [];
  const important = exam.important_question_ids.map((id) => importantAll.find((q) => q.id === id)).filter(Boolean) as typeof importantAll;
  const visibleQuestions = user ? important : important.slice(0, 3);
  const subjectNames = Object.fromEntries([...subjectMap.values()].map((s) => [s.id, s.name]));
  const paragraphs = exam.overview.split(/\n\n+/).filter(Boolean);
  const freeMock = tests.find((t) => !t.is_premium) ?? tests[0];

  return (
    <>
      <JsonLd data={[
        courseJsonLd({ name: `${exam.name} preparation`, description: exam.tagline, path: `/exams/${exam.slug}` }),
        breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Exams", path: "/exams" }, { name: exam.short_name, path: `/exams/${exam.slug}` }]),
      ]} />
      <div className="border-b border-ink-200 bg-gradient-to-b from-brand-50 to-white">
        <Container className="py-10 sm:py-14">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Exams", href: "/exams" }, { label: exam.short_name }]} />
          <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-brand-700 shadow-card">
                <ExamIcon name={exam.icon} className="h-7 w-7" />
              </span>
              <div>
                <div className="flex flex-wrap gap-2">
                  <Badge tone="brand">{exam.category}</Badge>
                  <Badge tone="outline"><Landmark className="h-3 w-3" aria-hidden="true" /> {exam.conducting_body}</Badge>
                </div>
                <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">{exam.name}</h1>
                <p className="mt-2 max-w-2xl text-base text-ink-500">{exam.tagline}</p>
              </div>
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col">
              {user ? (
                freeMock && <ButtonLink href={`/mock-tests/${freeMock.slug}`}>Attempt a mock test</ButtonLink>
              ) : (
                <ButtonLink href="/signup">Start 30 Days Free Trial</ButtonLink>
              )}
              <ButtonLink href={`/previous-year-papers?exam=${exam.id}`} variant="outline">Previous year papers</ButtonLink>
            </div>
          </div>
        </Container>
      </div>

      <Container>
        <ExamNav sections={SECTIONS} />
        <div className="grid gap-10 py-10 lg:grid-cols-[1fr_300px]">
          <div className="min-w-0 space-y-14">
            <Block id="overview" title="Exam overview">
              <div className="prose-dp space-y-4 text-sm leading-relaxed text-ink-700 sm:text-base">
                {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
              </div>
            </Block>

            <Block id="eligibility" title="Eligibility">
              <ul className="grid gap-3 sm:grid-cols-2">
                {exam.eligibility.map((e) => (
                  <li key={e} className="flex items-start gap-2 rounded-xl border border-ink-200 bg-white p-4 text-sm text-ink-700">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-forest-600" aria-hidden="true" /> {e}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-ink-500">Always confirm age limits, reservations and qualifications in the latest official notification from {exam.conducting_body}.</p>
            </Block>

            <Block id="syllabus" title="Syllabus">
              <div className="divide-y divide-ink-200 rounded-2xl border border-ink-200 bg-white shadow-card">
                {exam.syllabus.map((sec, i) => (
                  <details key={sec.title} className="group px-5 py-4" open={i === 0}>
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-ink-900 [&::-webkit-details-marker]:hidden">
                      <span>{sec.title} <span className="ml-2 text-xs font-normal text-ink-500">{sec.topics.length} topics</span></span>
                      <ChevronDown className="h-4 w-4 shrink-0 text-ink-500 transition-transform group-open:rotate-180" aria-hidden="true" />
                    </summary>
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {sec.topics.map((t) => <li key={t} className="rounded-lg bg-ink-50 px-2.5 py-1 text-xs text-ink-700">{t}</li>)}
                    </ul>
                  </details>
                ))}
              </div>
            </Block>

            <Block id="pattern" title="Exam pattern">
              <div className="overflow-x-auto rounded-2xl border border-ink-200 bg-white shadow-card">
                <table className="w-full min-w-[640px] text-sm">
                  <thead>
                    <tr className="bg-ink-50 text-left text-xs font-semibold uppercase tracking-wide text-ink-500">
                      {["Stage", "Subject / Paper", "Questions", "Marks", "Duration", "Negative marking"].map((h) => <th key={h} className="px-4 py-3">{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {exam.exam_pattern.map((row, i) => (
                      <tr key={i} className="border-t border-ink-100">
                        <td className="px-4 py-3 font-medium text-ink-900">{row.stage}</td>
                        <td className="px-4 py-3 text-ink-700">{row.subject}</td>
                        <td className="px-4 py-3 text-ink-700">{row.questions}</td>
                        <td className="px-4 py-3 text-ink-700">{row.marks}</td>
                        <td className="px-4 py-3 text-ink-700">{row.duration}</td>
                        <td className="px-4 py-3 text-ink-700">{row.negative_marking}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Block>

            <Block id="books" title="Books" href={`/books?exam=${exam.id}`}>
              {books.length ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {books.map((m) => <MaterialCard key={m.id} item={m} subject={subjectMap.get(m.subject_id)} locked={m.is_premium && !access.canAccess("books")} />)}
                </div>
              ) : <EmptyState title="Books coming soon" description="We are preparing books for this exam." />}
            </Block>

            <Block id="notes" title="Notes" href={`/notes?exam=${exam.id}`}>
              {notes.length ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {notes.map((m) => <MaterialCard key={m.id} item={m} subject={subjectMap.get(m.subject_id)} locked={m.is_premium && !access.canAccess("notes")} />)}
                </div>
              ) : <EmptyState title="Notes coming soon" description="We are preparing notes for this exam." />}
            </Block>

            <Block id="papers" title="Previous year papers" href={`/previous-year-papers?exam=${exam.id}`}>
              {papers.length ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {papers.map((p) => <PaperCard key={p.id} paper={p} exam={examMap.get(p.exam_id)} locked={p.is_premium && !access.canAccess("papers")} />)}
                </div>
              ) : <EmptyState icon={FileText} title="No papers yet" description="Previous-year papers for this exam will be added soon." />}
            </Block>

            <Block id="mock-tests" title="Mock tests" href={`/mock-tests?exam=${exam.id}`}>
              {tests.length ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {tests.map((t) => <MockTestCard key={t.id} test={t} exam={exam} subject={t.subject_id ? subjectMap.get(t.subject_id) : undefined} locked={t.is_premium && !access.canAccess("mock_tests")} />)}
                </div>
              ) : <EmptyState icon={ClipboardCheck} title="No mock tests yet" description="Mock tests for this exam are being prepared." />}
            </Block>

            <Block id="important-questions" title="Important questions">
              {important.length ? (
                <>
                  <ImportantQuestions questions={visibleQuestions} subjectNames={subjectNames} />
                  {!user && important.length > 3 && (
                    <div className="mt-4 rounded-2xl border border-brand-200 bg-brand-50 p-5 text-center">
                      <p className="text-sm font-semibold text-ink-900">{important.length - 3} more important questions for {exam.short_name}</p>
                      <p className="mt-1 text-sm text-ink-700">Create a free account to see all of them with explanations, and practise thousands more in mock tests.</p>
                      <ButtonLink href={`/signup?next=/exams/${exam.slug}`} className="mt-4">Start free trial</ButtonLink>
                    </div>
                  )}
                </>
              ) : <EmptyState title="Coming soon" description="Curated important questions will appear here." />}
            </Block>

            <Block id="study-plan" title="8-week study plan">
              <ol className="relative space-y-4 border-l-2 border-brand-100 pl-6">
                {exam.study_plan.map((w) => (
                  <li key={w.week} className="relative">
                    <span className="absolute -left-[31px] top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-700 text-[10px] font-bold text-white" aria-hidden="true">{w.week}</span>
                    <div className="rounded-2xl border border-ink-200 bg-white p-4 shadow-card">
                      <p className="flex items-center gap-2 text-sm font-semibold text-ink-900"><CalendarDays className="h-4 w-4 text-brand-600" aria-hidden="true" /> Week {w.week}: {w.focus}</p>
                      <ul className="mt-2 space-y-1.5 text-sm text-ink-700">
                        {w.tasks.map((t) => <li key={t} className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-forest-500" aria-hidden="true" />{t}</li>)}
                      </ul>
                    </div>
                  </li>
                ))}
              </ol>
            </Block>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-32 lg:self-start">
            <div className="rounded-2xl border border-ink-200 bg-white p-5 shadow-card">
              <p className="text-sm font-semibold text-ink-900">At a glance</p>
              <dl className="mt-3 space-y-2 text-sm">
                <Row k="Conducting body" v={exam.conducting_body} />
                <Row k="Category" v={exam.category} />
                <Row k="Books & notes" v={`${books.length}${books.length === 6 ? "+" : ""} / ${notes.length}${notes.length === 6 ? "+" : ""}`} />
                <Row k="Papers" v={String(papers.length)} />
                <Row k="Mock tests" v={String(tests.length)} />
              </dl>
            </div>
            <div className="rounded-2xl bg-brand-900 p-5 text-white">
              <p className="text-sm font-semibold">{user ? "Ready to practise?" : "Start your 30-day free trial"}</p>
              <p className="mt-1 text-xs text-brand-100">{user ? "Attempt a timed mock and see subject-wise analysis." : "Books, notes, papers and mock tests for this exam — free for 30 days."}</p>
              {user ? (
                freeMock ? <ButtonLink href={`/mock-tests/${freeMock.slug}`} variant="saffron" size="sm" className="mt-4 w-full">Attempt a mock</ButtonLink> : <ButtonLink href="/mock-tests" variant="saffron" size="sm" className="mt-4 w-full">Browse mock tests</ButtonLink>
              ) : (
                <ButtonLink href="/signup" variant="saffron" size="sm" className="mt-4 w-full">Start free trial</ButtonLink>
              )}
              <Link href="/pricing" className="mt-3 block text-center text-xs text-brand-100 underline">See pricing</Link>
            </div>
          </aside>
        </div>
      </Container>
    </>
  );
}

function Block({ id, title, href, children }: { id: string; title: string; href?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-32" aria-labelledby={`${id}-h`}>
      <div className="mb-4 flex items-end justify-between gap-4">
        <h2 id={`${id}-h`} className="text-xl font-bold tracking-tight text-ink-900 sm:text-2xl">{title}</h2>
        {href && <Link href={href} className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-900">View all <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>}
      </div>
      {children}
    </section>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-ink-500">{k}</dt>
      <dd className="text-right font-medium text-ink-900">{v}</dd>
    </div>
  );
}
