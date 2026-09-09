import Link from "next/link";
import { ClipboardList, Pencil, Plus } from "lucide-react";
import { adminDb } from "@/lib/data";
import { convertPaperToMock, deletePaper } from "@/lib/admin/papers";
import { pageParams, sp1 } from "@/lib/admin/helpers";
import { PAPER_TYPE_LABELS } from "@/lib/utils";
import { PageHeader, Table, Td, Th } from "@/components/ui/misc";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { ConfirmButton, SubmitButton } from "@/components/admin/confirm-button";
import { FilterBar, FilterInput, FilterSelect, Pagination } from "@/components/admin/shared";

export const metadata = { title: "Previous year papers" };

export default async function PapersAdmin(props: PageProps<"/admin/papers">) {
  const sp = await props.searchParams;
  const store = await adminDb();
  const [exams, subjects] = await Promise.all([store.select("exams", { order: [{ column: "sort_order" }] }), store.select("subjects", { order: [{ column: "sort_order" }] })]);
  const q = sp1(sp.q), exam = sp1(sp.exam), year = sp1(sp.year), type = sp1(sp.type);
  const rows = await store.select("previous_year_papers", {
    eq: { ...(exam ? { exam_id: exam } : {}), ...(year ? { year: Number(year) } : {}), ...(type ? { paper_type: type as "prelims" } : {}) },
    ...(q ? { search: { columns: ["title"], term: q } } : {}),
    order: [{ column: "year", ascending: false }, { column: "title" }],
  });
  const years = Array.from(new Set((await store.select("previous_year_papers")).map((p) => p.year))).sort((a, b) => b - a);
  const { page, pageSize, offset } = pageParams(sp);
  const pageRows = rows.slice(offset, offset + pageSize);
  const ename = (id: string) => exams.find((e) => e.id === id)?.short_name ?? id;
  const sname = (id: string | null) => (id ? subjects.find((s) => s.id === id)?.name ?? id : "Mixed");

  return (
    <div>
      <PageHeader title="Previous year papers" description={`${rows.length} papers`} className="mb-5" actions={<ButtonLink href="/admin/papers/new" size="sm"><Plus className="h-4 w-4" aria-hidden="true" /> Add paper</ButtonLink>} />
      <FilterBar reset="/admin/papers">
        <FilterInput name="q" placeholder="Search title" defaultValue={q} />
        <FilterSelect name="exam" defaultValue={exam} options={exams.map((e) => ({ value: e.id, label: e.short_name }))} allLabel="All exams" />
        <FilterSelect name="year" defaultValue={year} options={years.map((y) => ({ value: String(y), label: String(y) }))} allLabel="All years" className="w-32" />
        <FilterSelect name="type" defaultValue={type} options={Object.entries(PAPER_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l }))} allLabel="All types" className="w-36" />
      </FilterBar>
      <Table>
        <thead><tr><Th>Paper</Th><Th>Exam</Th><Th>Year</Th><Th>Type</Th><Th>Qs / mins</Th><Th>Mock test</Th><Th>Status</Th><Th className="text-right">Actions</Th></tr></thead>
        <tbody>
          {pageRows.length === 0 && <tr><Td colSpan={8} className="text-center text-ink-500">No papers match.</Td></tr>}
          {pageRows.map((p) => (
            <tr key={p.id} className="hover:bg-ink-50/60">
              <Td><span className="font-medium text-ink-900">{p.title}</span><span className="block text-xs text-ink-500">{sname(p.subject_id)} · {p.downloads} downloads{p.file_path ? "" : " · no PDF"}</span></Td>
              <Td>{ename(p.exam_id)}</Td>
              <Td>{p.year}</Td>
              <Td>{PAPER_TYPE_LABELS[p.paper_type]}</Td>
              <Td>{p.total_questions} / {p.duration_minutes ?? "—"}</Td>
              <Td>
                {p.mock_test_id ? (
                  <Link href={`/admin/mock-tests/${p.mock_test_id}/questions`} className="inline-flex items-center gap-1 text-sm font-medium text-brand-700"><ClipboardList className="h-3.5 w-3.5" aria-hidden="true" /> Linked</Link>
                ) : (
                  <form action={convertPaperToMock}><input type="hidden" name="id" value={p.id} /><SubmitButton variant="secondary" size="sm">Convert to mock</SubmitButton></form>
                )}
              </Td>
              <Td><div className="flex gap-1">{p.is_premium ? <Badge tone="saffron">Premium</Badge> : <Badge tone="forest">Free</Badge>}{!p.is_published && <Badge>Draft</Badge>}</div></Td>
              <Td className="text-right">
                <div className="inline-flex items-center gap-1">
                  <ButtonLink href={`/admin/papers/${p.id}/edit`} variant="outline" size="sm"><Pencil className="h-3.5 w-3.5" aria-hidden="true" /> Edit</ButtonLink>
                  <form action={deletePaper} className="inline"><input type="hidden" name="id" value={p.id} /><ConfirmButton confirmLabel="Delete">Delete</ConfirmButton></form>
                </div>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Pagination page={page} pageSize={pageSize} total={rows.length} basePath="/admin/papers" params={{ q, exam, year, type }} />
    </div>
  );
}
