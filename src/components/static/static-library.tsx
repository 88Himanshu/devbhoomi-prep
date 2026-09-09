"use client";

import { Suspense, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Library } from "lucide-react";
import type { Exam, Material, Subject } from "@/lib/types";
import { EmptyState } from "@/components/ui/misc";
import { ButtonLink } from "@/components/ui/button";
import { FilterBar } from "@/components/library/filter-bar";
import { MaterialCard } from "@/components/library/material-card";
import { Pagination } from "@/components/library/pagination";

const PAGE_SIZE = 12;

interface Props { kind: "book" | "note"; materials: Material[]; subjects: Subject[]; exams: Exam[]; years: number[] }

/** Client-side filtered library for the static showcase (all data is embedded at build time). */
export function StaticLibrary(props: Props) {
  return (
    <Suspense fallback={null}>
      <Inner {...props} />
    </Suspense>
  );
}

function Inner({ kind, materials, subjects, exams, years }: Props) {
  const sp = useSearchParams();
  const get = (k: string) => sp.get(k) || undefined;
  const q = get("q"), exam = get("exam"), subject = get("subject"), language = get("language"), year = get("year"), sort = get("sort"), access = get("access");
  const page = Math.max(1, Number(get("page")) || 1);
  const basePath = kind === "book" ? "/books" : "/notes";
  const label = kind === "book" ? "Books" : "Notes";

  const all = useMemo(() => {
    const term = q?.toLowerCase();
    const list = materials.filter((m) =>
      (!exam || m.exam_ids.includes(exam)) &&
      (!subject || m.subject_id === subject) &&
      (!language || m.language === language) &&
      (!year || m.year === Number(year)) &&
      (access !== "free" || !m.is_premium) &&
      (access !== "premium" || m.is_premium) &&
      (!term || [m.title, m.description, m.author].some((s) => s.toLowerCase().includes(term))),
    );
    return sort === "popular" ? [...list].sort((a, b) => b.views - a.views) : [...list].sort((a, b) => b.created_at.localeCompare(a.created_at));
  }, [materials, q, exam, subject, language, year, sort, access]);

  const total = all.length;
  const items = all.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const subjectMap = new Map(subjects.map((s) => [s.id, s]));
  const examMap = new Map(exams.map((e) => [e.id, e]));
  const freeCount = all.filter((m) => !m.is_premium).length;

  return (
    <>
      <div className="mt-6">
        <FilterBar
          key={sp.toString()}
          basePath={basePath}
          q={q}
          placeholder={`Search ${label.toLowerCase()} by title, topic or author…`}
          filters={[
            { name: "exam", label: "Exams", options: exams.map((e) => ({ value: e.id, label: e.short_name })), value: exam },
            { name: "subject", label: "Subjects", options: subjects.map((s) => ({ value: s.id, label: s.name })), value: subject },
            { name: "language", label: "Languages", options: [{ value: "en", label: "English" }, { value: "hi", label: "Hindi" }, { value: "bilingual", label: "Bilingual" }], value: language },
            { name: "year", label: "Years", options: years.map((y) => ({ value: String(y), label: String(y) })), value: year },
            { name: "access", label: "Access", allLabel: "Free & premium", options: [{ value: "free", label: "Free only" }, { value: "premium", label: "Premium only" }], value: access },
            { name: "sort", label: "Sort", allLabel: "Latest first", options: [{ value: "popular", label: "Most popular" }], value: sort },
          ]}
        />
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-2 text-sm text-ink-500">
        <p><span className="font-semibold text-ink-900">{total}</span> {total === 1 ? "result" : "results"}{freeCount > 0 && <> · {freeCount} free</>}{q && <> for “{q}”</>}</p>
        <p className="text-xs">Sign up for a 30-day free trial on the full platform to unlock premium {label.toLowerCase()}.</p>
      </div>
      {items.length === 0 ? (
        <EmptyState className="mt-6" icon={Library} title={`No ${label.toLowerCase()} match these filters`} description="Try a different subject or exam, or clear the filters." action={<ButtonLink href={basePath} variant="outline" size="sm">Clear filters</ButtonLink>} />
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((m) => (
            <MaterialCard key={m.id} material={m} subject={subjectMap.get(m.subject_id)} exams={m.exam_ids.map((id) => examMap.get(id)).filter(Boolean) as Exam[]} locked={m.is_premium} showBookmark={false} />
          ))}
        </div>
      )}
      <Pagination page={page} pageSize={PAGE_SIZE} total={total} basePath={basePath} params={{ q, exam, subject, language, year, sort, access }} />
      <p className="mt-10 rounded-xl bg-ink-50 px-4 py-3 text-center text-xs text-ink-500">
        All materials are original, licensed, public-domain or authorised. Devbhoomi Prep does not distribute copyrighted commercial books. See our <Link href="/copyright-policy" className="font-medium text-brand-700 underline">Copyright Policy</Link>.
      </p>
    </>
  );
}
