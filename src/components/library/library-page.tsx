import Link from "next/link";
import { BookOpen, Library, NotebookPen } from "lucide-react";
import type { Material, PremiumFeature } from "@/lib/types";
import { getSessionUser } from "@/lib/auth/session";
import { getAccess } from "@/lib/access";
import { getExams, getSubjects, listMaterials } from "@/lib/services/catalog";
import { materialYears } from "@/lib/services/materials";
import { bookmarkedIds } from "@/lib/services/bookmarks";
import { listProgress } from "@/lib/services/progress";
import { Container, EmptyState, PageHeader } from "@/components/ui/misc";
import { ButtonLink } from "@/components/ui/button";
import { FilterBar } from "./filter-bar";
import { MaterialCard } from "./material-card";
import { Pagination } from "./pagination";

const PAGE_SIZE = 12;

export interface LibrarySearchParams {
  q?: string; exam?: string; subject?: string; language?: string; year?: string; sort?: string; access?: string; page?: string;
}

const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;

export async function LibraryPage({ kind, searchParams }: { kind: "book" | "note"; searchParams: Record<string, string | string[] | undefined> }) {
  const sp: LibrarySearchParams = {
    q: str(searchParams.q), exam: str(searchParams.exam), subject: str(searchParams.subject), language: str(searchParams.language),
    year: str(searchParams.year), sort: str(searchParams.sort), access: str(searchParams.access), page: str(searchParams.page),
  };
  const page = Math.max(1, Number(sp.page) || 1);
  const feature: PremiumFeature = kind === "book" ? "books" : "notes";
  const basePath = kind === "book" ? "/books" : "/notes";
  const label = kind === "book" ? "Books" : "Notes";

  const [user, access, exams, subjects, years] = await Promise.all([getSessionUser(), getAccess(), getExams(), getSubjects(), materialYears(kind)]);
  const filters = {
    q: sp.q, examId: sp.exam, subjectId: sp.subject, language: sp.language, year: sp.year ? Number(sp.year) : undefined,
    sort: sp.sort === "popular" ? ("popular" as const) : ("latest" as const),
    premium: sp.access === "free" ? false : sp.access === "premium" ? true : undefined,
  };
  const all: Material[] = await listMaterials(kind, filters);
  const total = all.length;
  const items = all.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const [saved, progress] = user
    ? await Promise.all([bookmarkedIds(user.id, kind), listProgress(user.id, kind)])
    : [new Set<string>(), []];
  const progressMap = new Map(progress.map((p) => [p.item_id, p.progress_percent]));
  const subjectMap = new Map(subjects.map((s) => [s.id, s]));
  const examMap = new Map(exams.map((e) => [e.id, e]));
  const locked = !access.canAccess(feature);
  const freeCount = all.filter((m) => !m.is_premium).length;

  return (
    <Container className="py-8 sm:py-10">
      <PageHeader
        eyebrow="Digital library"
        title={kind === "book" ? "Books" : "Study Notes"}
        description={kind === "book"
          ? "Original books and practice workbooks prepared for Uttarakhand government exams. Read online, preview or download."
          : "Concise, exam-focused notes for quick revision across UKPSC, UKSSSC, Police and other Uttarakhand exams."}
        actions={<ButtonLink href={kind === "book" ? "/notes" : "/books"} variant="outline" size="sm">{kind === "book" ? <NotebookPen className="h-4 w-4" /> : <BookOpen className="h-4 w-4" />}Browse {kind === "book" ? "Notes" : "Books"}</ButtonLink>}
      />

      <div className="mt-6">
        <FilterBar
          basePath={basePath}
          q={sp.q}
          placeholder={`Search ${label.toLowerCase()} by title, topic or author…`}
          filters={[
            { name: "exam", label: "Exams", options: exams.map((e) => ({ value: e.id, label: e.short_name })), value: sp.exam },
            { name: "subject", label: "Subjects", options: subjects.map((s) => ({ value: s.id, label: s.name })), value: sp.subject },
            { name: "language", label: "Languages", options: [{ value: "en", label: "English" }, { value: "hi", label: "Hindi" }, { value: "bilingual", label: "Bilingual" }], value: sp.language },
            { name: "year", label: "Years", options: years.map((y) => ({ value: String(y), label: String(y) })), value: sp.year },
            { name: "access", label: "Access", allLabel: "Free & premium", options: [{ value: "free", label: "Free only" }, { value: "premium", label: "Premium only" }], value: sp.access },
            { name: "sort", label: "Sort", allLabel: "Latest first", options: [{ value: "popular", label: "Most popular" }], value: sp.sort },
          ]}
        />
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-2 text-sm text-ink-500">
        <p>
          <span className="font-semibold text-ink-900">{total}</span> {total === 1 ? "result" : "results"}
          {freeCount > 0 && <> · {freeCount} free</>}
          {sp.q && <> for “{sp.q}”</>}
        </p>
        {locked && !access.isAuthenticated && <p className="text-xs">Sign up for a 30-day free trial to unlock premium {label.toLowerCase()}.</p>}
      </div>

      {items.length === 0 ? (
        <EmptyState className="mt-6" icon={Library} title={`No ${label.toLowerCase()} match these filters`} description="Try a different subject or exam, or clear the filters." action={<ButtonLink href={basePath} variant="outline" size="sm">Clear filters</ButtonLink>} />
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((m) => (
            <MaterialCard
              key={m.id}
              material={m}
              subject={subjectMap.get(m.subject_id)}
              exams={m.exam_ids.map((id) => examMap.get(id)).filter(Boolean) as NonNullable<ReturnType<typeof examMap.get>>[]}
              locked={m.is_premium && locked}
              bookmarked={saved.has(m.id)}
              progress={progressMap.get(m.id) ?? null}
            />
          ))}
        </div>
      )}

      <Pagination page={page} pageSize={PAGE_SIZE} total={total} basePath={basePath} params={{ q: sp.q, exam: sp.exam, subject: sp.subject, language: sp.language, year: sp.year, sort: sp.sort, access: sp.access }} />

      <p className="mt-10 rounded-xl bg-ink-50 px-4 py-3 text-center text-xs text-ink-500">
        All materials are original, licensed, public-domain or authorised. Devbhoomi Prep does not distribute copyrighted commercial books. See our <Link href="/copyright-policy" className="font-medium text-brand-700 underline">Copyright Policy</Link>.
      </p>
    </Container>
  );
}
