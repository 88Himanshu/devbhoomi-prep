import Link from "next/link";
import { ListChecks, Pencil, Plus } from "lucide-react";
import { adminDb } from "@/lib/data";
import { deleteMockTest, toggleMockFlag } from "@/lib/admin/mock-tests";
import { pageParams, sp1 } from "@/lib/admin/helpers";
import { DIFFICULTY_LABELS } from "@/lib/utils";
import { PageHeader, Table, Td, Th } from "@/components/ui/misc";
import { Badge, difficultyTone } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/form";
import { ConfirmButton, SubmitButton } from "@/components/admin/confirm-button";
import { FilterBar, FilterInput, FilterSelect, Pagination } from "@/components/admin/shared";

export const metadata = { title: "Mock tests" };

export default async function MockTestsAdmin(props: PageProps<"/admin/mock-tests">) {
  const sp = await props.searchParams;
  const store = await adminDb();
  const [exams, subjects, attempts] = await Promise.all([store.select("exams", { order: [{ column: "sort_order" }] }), store.select("subjects"), store.select("test_attempts")]);
  const q = sp1(sp.q), exam = sp1(sp.exam), status = sp1(sp.status);
  let rows = await store.select("mock_tests", { ...(exam ? { eq: { exam_id: exam } } : {}), ...(q ? { search: { columns: ["title", "description"], term: q } } : {}), order: [{ column: "created_at", ascending: false }] });
  if (status === "published") rows = rows.filter((r) => r.is_published);
  if (status === "draft") rows = rows.filter((r) => !r.is_published);
  const { page, pageSize, offset } = pageParams(sp);
  const pageRows = rows.slice(offset, offset + pageSize);
  const attemptCount = (id: string) => attempts.filter((a) => a.mock_test_id === id).length;

  return (
    <div>
      <PageHeader title="Mock tests" description={`${rows.length} tests`} className="mb-5" actions={<ButtonLink href="/admin/mock-tests/new" size="sm"><Plus className="h-4 w-4" aria-hidden="true" /> Create test</ButtonLink>} />
      <FilterBar reset="/admin/mock-tests">
        <FilterInput name="q" placeholder="Search title" defaultValue={q} />
        <FilterSelect name="exam" defaultValue={exam} options={exams.map((e) => ({ value: e.id, label: e.short_name }))} allLabel="All exams" />
        <FilterSelect name="status" defaultValue={status} options={[{ value: "published", label: "Published" }, { value: "draft", label: "Draft" }]} allLabel="Any status" className="w-36" />
      </FilterBar>
      <Table>
        <thead><tr><Th>Test</Th><Th>Exam / subject</Th><Th>Difficulty</Th><Th>Questions</Th><Th>Attempts</Th><Th>Premium</Th><Th>Published</Th><Th className="text-right">Actions</Th></tr></thead>
        <tbody>
          {pageRows.length === 0 && <tr><Td colSpan={8} className="text-center text-ink-500">No tests match.</Td></tr>}
          {pageRows.map((m) => {
            const n = attemptCount(m.id);
            return (
              <tr key={m.id} className="hover:bg-ink-50/60">
                <Td><Link href={`/mock-tests/${m.slug}`} target="_blank" className="font-medium text-ink-900 hover:text-brand-700">{m.title}</Link><span className="block text-xs text-ink-500">{m.duration_minutes} min · −{m.negative_marks}/wrong{m.is_pyp ? " · PYP" : ""}</span></Td>
                <Td className="text-xs">{exams.find((e) => e.id === m.exam_id)?.short_name}<span className="block text-ink-500">{m.subject_id ? subjects.find((s) => s.id === m.subject_id)?.name : "Full-length"}</span></Td>
                <Td><Badge tone={difficultyTone(m.difficulty)}>{DIFFICULTY_LABELS[m.difficulty]}</Badge></Td>
                <Td>{m.question_count} <span className="text-xs text-ink-500">({m.total_marks} marks)</span></Td>
                <Td>{n}</Td>
                <Td><Flag id={m.id} field="is_premium" value={m.is_premium} onLabel="Premium" offLabel="Free" onTone="saffron" /></Td>
                <Td><Flag id={m.id} field="is_published" value={m.is_published} onLabel="Live" offLabel="Draft" onTone="forest" /></Td>
                <Td className="text-right">
                  <div className="inline-flex items-center gap-1">
                    <ButtonLink href={`/admin/mock-tests/${m.id}/questions`} variant="secondary" size="sm"><ListChecks className="h-3.5 w-3.5" aria-hidden="true" /> Questions</ButtonLink>
                    <ButtonLink href={`/admin/mock-tests/${m.id}/edit`} variant="outline" size="sm"><Pencil className="h-3.5 w-3.5" aria-hidden="true" /> Edit</ButtonLink>
                    <form action={deleteMockTest} className="inline-flex items-center gap-2"><input type="hidden" name="id" value={m.id} />{n > 0 && <label className="flex items-center gap-1 text-xs text-ink-500"><Checkbox name="force" /> force</label>}<ConfirmButton confirmLabel="Delete">Delete</ConfirmButton></form>
                  </div>
                </Td>
              </tr>
            );
          })}
        </tbody>
      </Table>
      <Pagination page={page} pageSize={pageSize} total={rows.length} basePath="/admin/mock-tests" params={{ q, exam, status }} />
    </div>
  );
}

function Flag({ id, field, value, onLabel, offLabel, onTone }: { id: string; field: string; value: boolean; onLabel: string; offLabel: string; onTone: "saffron" | "forest" }) {
  return (
    <form action={toggleMockFlag}>
      <input type="hidden" name="id" value={id} /><input type="hidden" name="field" value={field} /><input type="hidden" name="value" value={value ? "0" : "1"} />
      <SubmitButton variant="ghost" size="sm" className="h-8 px-2"><Badge tone={value ? onTone : "neutral"}>{value ? onLabel : offLabel}</Badge></SubmitButton>
    </form>
  );
}
