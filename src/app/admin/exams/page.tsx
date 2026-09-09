import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { adminDb } from "@/lib/data";
import { deleteExam, toggleExamFlag } from "@/lib/admin/exams";
import { PageHeader, Table, Td, Th } from "@/components/ui/misc";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/form";
import { ConfirmButton, SubmitButton } from "@/components/admin/confirm-button";

export const metadata = { title: "Exams" };

export default async function ExamsAdmin() {
  const store = await adminDb();
  const [exams, tests, papers, books, notes] = await Promise.all([
    store.select("exams", { order: [{ column: "sort_order" }] }),
    store.select("mock_tests"), store.select("previous_year_papers"), store.select("books"), store.select("notes"),
  ]);
  const count = (id: string) => ({
    tests: tests.filter((t) => t.exam_id === id).length,
    papers: papers.filter((p) => p.exam_id === id).length,
    materials: [...books, ...notes].filter((m) => m.exam_ids.includes(id)).length,
  });
  return (
    <div>
      <PageHeader title="Exams" description="Each exam gets a public page with syllabus, pattern, books, papers and mock tests." className="mb-5" actions={<ButtonLink href="/admin/exams/new" size="sm"><Plus className="h-4 w-4" aria-hidden="true" /> Add exam</ButtonLink>} />
      <Table>
        <thead><tr><Th>#</Th><Th>Exam</Th><Th>Category</Th><Th>Content</Th><Th>Featured</Th><Th>Active</Th><Th className="text-right">Actions</Th></tr></thead>
        <tbody>
          {exams.map((e) => {
            const c = count(e.id);
            return (
              <tr key={e.id} className="hover:bg-ink-50/60">
                <Td className="text-ink-500">{e.sort_order}</Td>
                <Td><Link href={`/exams/${e.slug}`} target="_blank" className="font-medium text-ink-900 hover:text-brand-700">{e.name}</Link><span className="block text-xs text-ink-500">/exams/{e.slug} · {e.conducting_body}</span></Td>
                <Td>{e.category}</Td>
                <Td className="text-xs">{c.tests} tests · {c.papers} papers · {c.materials} materials</Td>
                <Td><FlagForm id={e.id} field="is_featured" value={e.is_featured} /></Td>
                <Td><FlagForm id={e.id} field="is_active" value={e.is_active} /></Td>
                <Td className="text-right">
                  <div className="inline-flex items-center gap-1">
                    <ButtonLink href={`/admin/exams/${e.id}/edit`} variant="outline" size="sm"><Pencil className="h-3.5 w-3.5" aria-hidden="true" /> Edit</ButtonLink>
                    <form action={deleteExam} className="inline-flex items-center gap-2">
                      <input type="hidden" name="id" value={e.id} />
                      {(c.tests || c.papers) > 0 && <label className="flex items-center gap-1 text-xs text-ink-500"><Checkbox name="force" /> force</label>}
                      <ConfirmButton confirmLabel="Delete">Delete</ConfirmButton>
                    </form>
                  </div>
                </Td>
              </tr>
            );
          })}
        </tbody>
      </Table>
      {exams.length === 0 && <p className="mt-4 text-sm text-ink-500">No exams yet.</p>}
      <p className="mt-3 text-xs text-ink-500"><Badge tone="outline">Tip</Badge> Toggle badges to feature or hide an exam instantly.</p>
    </div>
  );
}

function FlagForm({ id, field, value }: { id: string; field: "is_featured" | "is_active"; value: boolean }) {
  return (
    <form action={toggleExamFlag}>
      <input type="hidden" name="id" value={id} /><input type="hidden" name="field" value={field} /><input type="hidden" name="value" value={value ? "0" : "1"} />
      <SubmitButton variant="ghost" size="sm" className="h-8 px-2"><Badge tone={value ? (field === "is_featured" ? "saffron" : "forest") : "neutral"}>{value ? "Yes" : "No"}</Badge></SubmitButton>
    </form>
  );
}
