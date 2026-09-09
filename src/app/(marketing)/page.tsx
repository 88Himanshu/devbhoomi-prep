import { BarChart3, BookOpen, ClipboardCheck, FileText } from "lucide-react";
import { getSessionUser } from "@/lib/auth/session";
import { getAccess } from "@/lib/access";
import { db } from "@/lib/data";
import {
  getActiveAnnouncements, getExamMap, getExams, getPlatformStats, getSubjectMap, listMaterials, listMockTests, listPapers,
} from "@/lib/services/catalog";
import { JsonLd, organizationJsonLd, pageMetadata, websiteJsonLd } from "@/lib/seo";
import { Container } from "@/components/ui/misc";
import { ButtonLink } from "@/components/ui/button";
import { HeroIllustration } from "@/components/marketing/hero-illustration";
import { AnnouncementBanner, FinalCta, HowItWorks, Section, SectionHeader, Testimonials, TrustStrip } from "@/components/marketing/sections";
import { MaterialCard, MockTestCard, PaperCard } from "@/components/marketing/catalog-cards";
import { PricingCards, SecurePaymentNote } from "@/components/marketing/pricing";
import { Faq } from "@/components/marketing/faq";
import { DashboardPreview } from "@/components/marketing/dashboard-preview";
import { ExamCard } from "@/components/exams/exam-card";

export const metadata = pageMetadata({
  title: "Uttarakhand Competitive Exam Preparation – Books, Papers & Mock Tests",
  description: "Prepare for UKPSC, UKSSSC, Uttarakhand Police, Patwari, VDO, Forest Guard and more with original study material, previous-year papers, timed mock tests and performance analytics. Start a 30-day free trial.",
  path: "/",
});

function roundLabel(n: number) {
  if (n >= 1000) return `${Math.floor(n / 1000) * 1000}+`.replace(/000\+$/, ",000+");
  if (n >= 100) return `${Math.floor(n / 50) * 50}+`;
  return `${n}+`;
}

export default async function HomePage() {
  const user = await getSessionUser();
  const [access, stats, exams, examMap, subjectMap, banners, books, notes, papers, tests, store] = await Promise.all([
    getAccess(), getPlatformStats(), getExams(), getExamMap(), getSubjectMap(), getActiveAnnouncements("banner"),
    listMaterials("book", { featured: true, limit: 2 }), listMaterials("note", { featured: true, limit: 2 }),
    listPapers({ limit: 6 }), listMockTests({ limit: 6 }), db(),
  ]);
  const [mockCounts, paperCounts] = await Promise.all([
    store.select("mock_tests", { eq: { is_published: true } }),
    store.select("previous_year_papers", { eq: { is_published: true } }),
  ]);
  const countBy = (rows: { exam_id: string }[]) => rows.reduce<Record<string, number>>((m, r) => ((m[r.exam_id] = (m[r.exam_id] ?? 0) + 1), m), {});
  const mocksByExam = countBy(mockCounts);
  const papersByExam = countBy(paperCounts);
  const featuredExams = exams.filter((e) => e.is_featured).slice(0, 6);
  const featuredMaterials = [...books, ...notes];
  const signedIn = Boolean(user);

  return (
    <>
      <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
      <AnnouncementBanner items={banners} />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-gradient-to-b from-brand-50 to-white" aria-hidden="true" />
        <Container className="grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-[1.05fr_1fr] lg:py-24">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-forest-200 bg-forest-50 px-3 py-1 text-xs font-semibold text-forest-700">
              <span className="h-1.5 w-1.5 rounded-full bg-forest-500" aria-hidden="true" /> Built for Uttarakhand aspirants
            </span>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-ink-900 sm:text-5xl lg:text-[3.4rem] lg:leading-[1.1]">
              Prepare Smarter. <span className="text-brand-700">Crack Uttarakhand</span> Government Exams.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-ink-500">
              Everything you need for UKPSC, UKSSSC, Police, Patwari, VDO, Forest Guard and teaching exams: original books and notes, previous-year papers, timed mock tests and analytics that show exactly what to improve.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {signedIn ? (
                <ButtonLink href="/dashboard" size="lg">Go to Dashboard</ButtonLink>
              ) : (
                <ButtonLink href="/signup" size="lg">Start 30 Days Free Trial</ButtonLink>
              )}
              <ButtonLink href="/exams" variant="outline" size="lg">Explore Courses</ButtonLink>
            </div>
            <p className="mt-4 text-xs text-ink-500">No card required · Cancel anytime · Original & licensed content only</p>
          </div>
          <div className="animate-fade-up lg:justify-self-end" style={{ animationDelay: "120ms" }}>
            <HeroIllustration className="w-full max-w-xl drop-shadow-sm" />
          </div>
        </Container>
        <Container className="pb-6">
          <TrustStrip
            stats={[
              { label: "Study Materials", value: roundLabel(stats.materials), icon: BookOpen },
              { label: "Mock Tests", value: roundLabel(stats.tests), icon: ClipboardCheck },
              { label: "Previous Year Papers", value: roundLabel(stats.papers), icon: FileText },
              { label: "Performance Analytics", value: "Subject-wise", icon: BarChart3 },
            ]}
          />
        </Container>
      </section>

      <Section id="exams" tone="muted">
        <SectionHeader eyebrow="Popular exams" title="Choose your exam" description="Dedicated pages with syllabus, pattern, eligibility, material and tests for every major Uttarakhand recruitment." href="/exams" linkLabel="All exams" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featuredExams.map((exam) => (
            <ExamCard key={exam.id} exam={exam} mocks={mocksByExam[exam.id] ?? 0} papers={papersByExam[exam.id] ?? 0} />
          ))}
        </div>
      </Section>

      <Section id="materials">
        <SectionHeader eyebrow="Study materials" title="Books & notes written for these exams" description="Original, exam-mapped notes and books in English, Hindi and bilingual editions." href="/books" linkLabel="Browse library" />
        <div className="grid gap-4 md:grid-cols-2">
          {featuredMaterials.map((m) => (
            <MaterialCard key={m.id} item={m} subject={subjectMap.get(m.subject_id)} locked={m.is_premium && !access.canAccess(m.kind === "book" ? "books" : "notes")} />
          ))}
        </div>
      </Section>

      <Section id="papers" tone="muted">
        <SectionHeader eyebrow="Previous year papers" title="Practise with real question papers" description="Filter by exam, year and subject. View, download or attempt a paper as a timed mock test." href="/previous-year-papers" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {papers.map((p) => (
            <PaperCard key={p.id} paper={p} exam={examMap.get(p.exam_id)} locked={p.is_premium && !access.canAccess("papers")} />
          ))}
        </div>
      </Section>

      <Section id="mock-tests">
        <SectionHeader eyebrow="Mock tests" title="Timed tests built to the real pattern" description="Countdown timer, question palette, mark for review, negative marking and detailed solutions after submission." href="/mock-tests" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tests.map((t) => (
            <MockTestCard key={t.id} test={t} exam={examMap.get(t.exam_id)} subject={t.subject_id ? subjectMap.get(t.subject_id) : undefined} locked={t.is_premium && !access.canAccess("mock_tests")} />
          ))}
        </div>
      </Section>

      <Section id="dashboard" tone="muted">
        <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <SectionHeader eyebrow="Student dashboard" title="Know exactly where you stand" description="Score history, subject-wise accuracy, weak and strong areas, time management and a study streak — all updated after every test." />
            <ul className="space-y-3 text-sm text-ink-700">
              {["Continue where you left off in any book or note", "Recommended tests based on your weak subjects", "Bookmark questions, books and tests for quick revision", "Trial and subscription status always visible"].map((t) => (
                <li key={t} className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-forest-500" aria-hidden="true" />{t}</li>
              ))}
            </ul>
            <ButtonLink href={signedIn ? "/dashboard" : "/signup"} className="mt-6">{signedIn ? "Open my dashboard" : "Create free account"}</ButtonLink>
          </div>
          <DashboardPreview />
        </div>
      </Section>

      <Section id="how-it-works">
        <SectionHeader eyebrow="How it works" title="From sign-up to selection-ready in four steps" />
        <HowItWorks />
      </Section>

      <Section id="pricing" tone="muted">
        <SectionHeader eyebrow="Pricing" title="Simple, affordable plans" description="Start free for 30 days. Upgrade only if it helps you." href="/pricing" linkLabel="Compare plans" />
        <PricingCards signedIn={signedIn} access={access} compact />
        <div className="mt-6"><SecurePaymentNote /></div>
      </Section>

      <Section id="faq">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHeader eyebrow="FAQ" title="Frequently asked questions" description="Everything about the trial, content, tests and refunds." />
          <Faq />
        </div>
      </Section>

      <Section id="testimonials" tone="muted">
        <SectionHeader eyebrow="Students" title="What aspirants say" description="Real feedback from students across Uttarakhand. Results depend on your preparation." />
        <Testimonials />
      </Section>

      <Section>
        <FinalCta signedIn={signedIn} />
      </Section>
    </>
  );
}
