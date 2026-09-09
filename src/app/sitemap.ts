import type { MetadataRoute } from "next";
import { env } from "@/lib/env";
import { adminDb } from "@/lib/data";

const STATIC: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/exams", priority: 0.9, changeFrequency: "weekly" },
  { path: "/books", priority: 0.8, changeFrequency: "weekly" },
  { path: "/notes", priority: 0.8, changeFrequency: "weekly" },
  { path: "/previous-year-papers", priority: 0.8, changeFrequency: "weekly" },
  { path: "/mock-tests", priority: 0.8, changeFrequency: "weekly" },
  { path: "/pricing", priority: 0.7, changeFrequency: "monthly" },
  { path: "/about", priority: 0.4, changeFrequency: "yearly" },
  { path: "/contact", priority: 0.4, changeFrequency: "yearly" },
  { path: "/privacy-policy", priority: 0.2, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.2, changeFrequency: "yearly" },
  { path: "/refund-policy", priority: 0.2, changeFrequency: "yearly" },
  { path: "/copyright-policy", priority: 0.2, changeFrequency: "yearly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env.APP_URL.replace(/\/$/, "");
  const store = await adminDb();
  const [exams, books, notes, tests] = await Promise.all([
    store.select("exams", { eq: { is_active: true } }),
    store.select("books", { eq: { is_published: true } }),
    store.select("notes", { eq: { is_published: true } }),
    store.select("mock_tests", { eq: { is_published: true } }),
  ]);
  const entry = (path: string, priority: number, changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"], lastModified?: string): MetadataRoute.Sitemap[number] => ({
    url: `${base}${path}`, priority, changeFrequency, lastModified: lastModified ? new Date(lastModified) : new Date(),
  });
  return [
    ...STATIC.map((s) => entry(s.path, s.priority, s.changeFrequency)),
    ...exams.map((e) => entry(`/exams/${e.slug}`, 0.9, "weekly", e.created_at)),
    ...books.map((b) => entry(`/books/${b.slug}`, 0.6, "monthly", b.created_at)),
    ...notes.map((n) => entry(`/notes/${n.slug}`, 0.6, "monthly", n.created_at)),
    ...tests.map((t) => entry(`/mock-tests/${t.slug}`, 0.6, "monthly", t.created_at)),
  ];
}
