import "server-only";
import { db } from "@/lib/data";
import type { Exam, Material, MockTest, PreviousYearPaper, Question } from "@/lib/types";

export interface SearchResults {
  term: string;
  exams: Exam[];
  books: Material[];
  notes: Material[];
  papers: PreviousYearPaper[];
  mockTests: MockTest[];
  questions: Question[];
}

export type SearchGroup = "exams" | "books" | "notes" | "papers" | "mockTests" | "questions";

export async function searchAll(term: string, opts: { limit?: number; groups?: SearchGroup[] } = {}): Promise<SearchResults> {
  const q = term.trim().slice(0, 100);
  const limit = opts.limit ?? 10;
  const want = (g: SearchGroup) => !opts.groups || opts.groups.includes(g);
  const empty: SearchResults = { term: q, exams: [], books: [], notes: [], papers: [], mockTests: [], questions: [] };
  if (q.length < 2) return empty;
  const store = await db();
  const [exams, books, notes, papers, mockTests, questions] = await Promise.all([
    want("exams") ? store.select("exams", { eq: { is_active: true }, search: { columns: ["name", "short_name", "tagline", "conducting_body"], term: q }, limit }) : [],
    want("books") ? store.select("books", { eq: { is_published: true }, search: { columns: ["title", "description", "author"], term: q }, limit }) : [],
    want("notes") ? store.select("notes", { eq: { is_published: true }, search: { columns: ["title", "description", "author"], term: q }, limit }) : [],
    want("papers") ? store.select("previous_year_papers", { eq: { is_published: true }, search: { columns: ["title"], term: q }, order: [{ column: "year", ascending: false }], limit }) : [],
    want("mockTests") ? store.select("mock_tests", { eq: { is_published: true }, search: { columns: ["title", "description"], term: q }, limit }) : [],
    want("questions") ? store.select("questions", { eq: { is_active: true }, search: { columns: ["text"], term: q }, limit }) : [],
  ]);
  return { term: q, exams, books, notes, papers, mockTests, questions };
}

export interface Suggestion { group: string; label: string; href: string; hint?: string }

/** Compact suggestions for autocomplete (top 3 per group). */
export async function suggest(term: string): Promise<Suggestion[]> {
  const r = await searchAll(term, { limit: 3 });
  const out: Suggestion[] = [];
  r.exams.forEach((e) => out.push({ group: "Exams", label: e.name, href: `/exams/${e.slug}`, hint: e.conducting_body }));
  r.books.forEach((b) => out.push({ group: "Books", label: b.title, href: `/books/${b.slug}`, hint: b.author }));
  r.notes.forEach((n) => out.push({ group: "Notes", label: n.title, href: `/notes/${n.slug}`, hint: n.author }));
  r.papers.forEach((p) => out.push({ group: "Papers", label: p.title, href: `/previous-year-papers?q=${encodeURIComponent(p.title)}`, hint: String(p.year) }));
  r.mockTests.forEach((m) => out.push({ group: "Mock Tests", label: m.title, href: `/mock-tests/${m.slug}`, hint: `${m.question_count} Qs` }));
  r.questions.forEach((q) => out.push({ group: "Questions", label: q.text.length > 90 ? q.text.slice(0, 90) + "…" : q.text, href: `/search?q=${encodeURIComponent(r.term)}&type=questions` }));
  return out;
}

export const totalResults = (r: SearchResults) =>
  r.exams.length + r.books.length + r.notes.length + r.papers.length + r.mockTests.length + r.questions.length;
