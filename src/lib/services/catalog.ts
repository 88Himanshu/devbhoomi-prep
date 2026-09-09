import "server-only";
import { cache } from "react";
import { db } from "@/lib/data";
import type { Exam, Material, MockTest, PreviousYearPaper, Subject } from "@/lib/types";

/** Read-side helpers shared by public pages, dashboard, search and admin. */

export const getSubjects = cache(async (): Promise<Subject[]> =>
  (await db()).select("subjects", { order: [{ column: "sort_order" }] }),
);

export const getSubjectMap = cache(async () => {
  const map = new Map<string, Subject>();
  for (const s of await getSubjects()) map.set(s.id, s);
  return map;
});

export const getExams = cache(async (opts: { includeInactive?: boolean } = {}): Promise<Exam[]> =>
  (await db()).select("exams", {
    ...(opts.includeInactive ? {} : { eq: { is_active: true } }),
    order: [{ column: "sort_order" }],
  }),
);

export const getExamMap = cache(async () => {
  const map = new Map<string, Exam>();
  for (const e of await getExams({ includeInactive: true })) map.set(e.id, e);
  return map;
});

export const getExamBySlug = cache(async (slug: string): Promise<Exam | null> =>
  (await db()).selectOne("exams", { eq: { slug } }),
);

export interface MaterialFilters {
  q?: string;
  examId?: string;
  subjectId?: string;
  language?: string;
  year?: number;
  sort?: "latest" | "popular";
  premium?: boolean;
  featured?: boolean;
  limit?: number;
  offset?: number;
}

export async function listMaterials(kind: "book" | "note", f: MaterialFilters = {}): Promise<Material[]> {
  const table = kind === "book" ? "books" : "notes";
  const eq: Partial<Material> = { is_published: true };
  if (f.subjectId) eq.subject_id = f.subjectId;
  if (f.language) eq.language = f.language as Material["language"];
  if (f.year) eq.year = f.year;
  if (f.premium !== undefined) eq.is_premium = f.premium;
  if (f.featured) eq.is_featured = true;
  return (await db()).select(table, {
    eq,
    ...(f.examId ? { contains: { exam_ids: f.examId } } : {}),
    ...(f.q ? { search: { columns: ["title", "description", "author"], term: f.q } } : {}),
    order: f.sort === "popular" ? [{ column: "views", ascending: false }] : [{ column: "created_at", ascending: false }],
    limit: f.limit,
    offset: f.offset,
  });
}

export const getMaterialBySlug = cache(async (kind: "book" | "note", slug: string): Promise<Material | null> =>
  (await db()).selectOne(kind === "book" ? "books" : "notes", { eq: { slug } }),
);

export interface PaperFilters {
  examId?: string;
  year?: number;
  subjectId?: string;
  paperType?: string;
  q?: string;
  limit?: number;
}

export async function listPapers(f: PaperFilters = {}): Promise<PreviousYearPaper[]> {
  const eq: Partial<PreviousYearPaper> = { is_published: true };
  if (f.examId) eq.exam_id = f.examId;
  if (f.year) eq.year = f.year;
  if (f.subjectId) eq.subject_id = f.subjectId;
  if (f.paperType) eq.paper_type = f.paperType as PreviousYearPaper["paper_type"];
  return (await db()).select("previous_year_papers", {
    eq,
    ...(f.q ? { search: { columns: ["title"], term: f.q } } : {}),
    order: [{ column: "year", ascending: false }, { column: "title" }],
    limit: f.limit,
  });
}

export interface MockTestFilters {
  examId?: string;
  subjectId?: string;
  difficulty?: string;
  premium?: boolean;
  q?: string;
  limit?: number;
}

export async function listMockTests(f: MockTestFilters = {}): Promise<MockTest[]> {
  const eq: Partial<MockTest> = { is_published: true };
  if (f.examId) eq.exam_id = f.examId;
  if (f.subjectId) eq.subject_id = f.subjectId;
  if (f.difficulty) eq.difficulty = f.difficulty as MockTest["difficulty"];
  if (f.premium !== undefined) eq.is_premium = f.premium;
  return (await db()).select("mock_tests", {
    eq,
    ...(f.q ? { search: { columns: ["title", "description"], term: f.q } } : {}),
    order: [{ column: "attempts_count", ascending: false }],
    limit: f.limit,
  });
}

export const getMockTestBySlug = cache(async (slug: string): Promise<MockTest | null> =>
  (await db()).selectOne("mock_tests", { eq: { slug } }),
);

export async function getActiveAnnouncements(type?: "banner" | "announcement") {
  const now = new Date().toISOString();
  const rows = await (await db()).select("announcements", {
    eq: { is_active: true, ...(type ? { type } : {}) },
    order: [{ column: "created_at", ascending: false }],
  });
  return rows.filter((a) => (!a.starts_at || a.starts_at <= now) && (!a.ends_at || a.ends_at >= now));
}

/** Platform-wide counters for the landing page trust strip. */
export const getPlatformStats = cache(async () => {
  const store = await db();
  const [books, notes, tests, papers, questions] = await Promise.all([
    store.count("books", { eq: { is_published: true } }),
    store.count("notes", { eq: { is_published: true } }),
    store.count("mock_tests", { eq: { is_published: true } }),
    store.count("previous_year_papers", { eq: { is_published: true } }),
    store.count("questions", { eq: { is_active: true } }),
  ]);
  return { materials: books + notes, tests, papers, questions };
});
