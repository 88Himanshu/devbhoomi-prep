import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { adminDb } from "@/lib/data";
import { deleteMaterial, toggleMaterialFlag } from "@/lib/admin/materials";
import { pageParams, sp1 } from "@/lib/admin/helpers";
import { formatDate, LANGUAGE_LABELS } from "@/lib/utils";
import { PageHeader, Table, Td, Th } from "@/components/ui/misc";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { ConfirmButton, SubmitButton } from "@/components/admin/confirm-button";
import { FilterBar, FilterInput, FilterSelect, Pagination } from "@/components/admin/shared";

export async function MaterialList({ kind, sp }: { kind: "book" | "note"; sp: Record<string, string | string[] | undefined> }) {
  const table = kind === "book" ? "books" : "notes";
  const base = `/admin/${table}`;
  const store = await adminDb();
  const [subjects, exams] = await Promise.all([store.select("subjects", { order: [{ column: "sort_order" }] }), store.select("exams", { order: [{ column: "sort_order" }] })]);
  const q = sp1(sp.q);
  const subject = sp1(sp.subject);
  const exam = sp1(sp.exam);
  const premium = sp1(sp.premium);
  const published = sp1(sp.published);
  let rows = await store.select(table, {
    ...(subject ? { eq: { subject_id: subject } } : {}),
    ...(exam ? { contains: { exam_ids: exam } } : {}),
    ...(q ? { search: { columns: ["title", "description", "author"], term: q } } : {}),
    order: [{ column: "created_at", ascending: false }],
  });
  if (premium) rows = rows.filter((r) => r.is_premium === (premium === "1"));
  if (published) rows = rows.filter((r) => r.is_published === (published === "1"));
  const { page, pageSize, offset } = pageParams(sp);
  const pageRows = rows.slice(offset, offset + pageSize);
  const sname = (id: string) => subjects.find((s) => s.id === id)?.name ?? id;
  const ename = (id: string) => exams.find((e) => e.id === id)?.short_name ?? id;
  const title = kind === "book" ? "Books" : "Notes";

  return (
    <div>
      <PageHeader title={title} description={`${rows.length} ${title.toLowerCase()} in the library`} className="mb-5" actions={<ButtonLink href={`${base}/new`} size="sm"><Plus className="h-4 w-4" aria-hidden="true" /> Add {kind}</ButtonLink>} />
      <FilterBar reset={base}>
        <FilterInput name="q" placeholder="Search title, author" defaultValue={q} className="w-56" />
        <FilterSelect name="subject" defaultValue={subject} options={subjects.map((s) => ({ value: s.id, label: s.name }))} allLabel="All subjects" />
        <FilterSelect name="exam" defaultValue={exam} options={exams.map((e) => ({ value: e.id, label: e.short_name }))} allLabel="All exams" />
        <FilterSelect name="premium" defaultValue={premium} options={[{ value: "1", label: "Premium" }, { value: "0", label: "Free" }]} allLabel="Premium & free" className="w-36" />
        <FilterSelect name="published" defaultValue={published} options={[{ value: "1", label: "Published" }, { value: "0", label: "Draft" }]} allLabel="Any status" className="w-36" />
      </FilterBar>
      <Table>
        <thead><tr><Th>Title</Th><Th>Subject</Th><Th>Exams</Th><Th>Lang</Th><Th>Stats</Th><Th>Premium</Th><Th>Published</Th><Th className="text-right">Actions</Th></tr></thead>
        <tbody>
          {pageRows.length === 0 && <tr><Td colSpan={8} className="text-center text-ink-500">Nothing matches.</Td></tr>}
          {pageRows.map((m) => (
            <tr key={m.id} className="hover:bg-ink-50/60">
              <Td>
                <div className="flex items-center gap-3">
                  <span className="h-10 w-7 shrink-0 rounded-sm" style={{ background: m.cover_color }} aria-hidden="true" />
                  <span><Link href={`/${table}/${m.slug}`} target="_blank" className="font-medium text-ink-900 hover:text-brand-700">{m.title}</Link><span className="block text-xs text-ink-500">{m.author} · {m.year} · {m.pages} pp · {m.source_license.replace("_", " ")}{m.is_featured ? " · featured" : ""}</span></span>
                </div>
              </Td>
              <Td>{sname(m.subject_id)}</Td>
              <Td className="text-xs">{m.exam_ids.map(ename).join(", ")}</Td>
              <Td>{LANGUAGE_LABELS[m.language]}</Td>
              <Td className="text-xs">{m.views} views · {m.downloads} dl<span className="block text-ink-500">{formatDate(m.created_at)}</span></Td>
              <Td><Flag kind={kind} id={m.id} field="is_premium" value={m.is_premium} onLabel="Premium" offLabel="Free" onTone="saffron" /></Td>
              <Td><Flag kind={kind} id={m.id} field="is_published" value={m.is_published} onLabel="Live" offLabel="Draft" onTone="forest" /></Td>
              <Td className="text-right">
                <div className="inline-flex items-center gap-1">
                  <ButtonLink href={`${base}/${m.id}/edit`} variant="outline" size="sm"><Pencil className="h-3.5 w-3.5" aria-hidden="true" /> Edit</ButtonLink>
                  <form action={deleteMaterial} className="inline"><input type="hidden" name="kind" value={kind} /><input type="hidden" name="id" value={m.id} /><ConfirmButton confirmLabel="Delete">Delete</ConfirmButton></form>
                </div>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Pagination page={page} pageSize={pageSize} total={rows.length} basePath={base} params={{ q, subject, exam, premium, published }} />
    </div>
  );
}

function Flag({ kind, id, field, value, onLabel, offLabel, onTone }: { kind: string; id: string; field: string; value: boolean; onLabel: string; offLabel: string; onTone: "saffron" | "forest" }) {
  return (
    <form action={toggleMaterialFlag}>
      <input type="hidden" name="kind" value={kind} /><input type="hidden" name="id" value={id} /><input type="hidden" name="field" value={field} /><input type="hidden" name="value" value={value ? "0" : "1"} />
      <SubmitButton variant="ghost" size="sm" className="h-8 px-2"><Badge tone={value ? onTone : "neutral"}>{value ? onLabel : offLabel}</Badge></SubmitButton>
    </form>
  );
}
