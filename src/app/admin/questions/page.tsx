import { Pencil, Plus, Upload } from "lucide-react";
import { adminDb } from "@/lib/data";
import { deleteQuestion, toggleQuestionActive } from "@/lib/admin/questions";
import { pageParams, sp1 } from "@/lib/admin/helpers";
import { DIFFICULTY_LABELS } from "@/lib/utils";
import { PageHeader, Table, Td, Th } from "@/components/ui/misc";
import { Badge, difficultyTone } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { ConfirmButton, SubmitButton } from "@/components/admin/confirm-button";
import { FilterBar, FilterInput, FilterSelect, Pagination } from "@/components/admin/shared";

export const metadata = { title: "Question bank" };

export default async function QuestionsAdmin(props: PageProps<"/admin/questions">) {
  const sp = await props.searchParams;
  const store = await adminDb();
  const [subjects, exams] = await Promise.all([store.select("subjects", { order: [{ column: "sort_order" }] }), store.select("exams", { order: [{ column: "sort_order" }] })]);
  const q = sp1(sp.q), subject = sp1(sp.subject), exam = sp1(sp.exam), difficulty = sp1(sp.difficulty), year = sp1(sp.year), active = sp1(sp.active);
  const rows = await store.select("questions", {
    eq: { ...(subject ? { subject_id: subject } : {}), ...(exam ? { exam_id: exam } : {}), ...(difficulty ? { difficulty: difficulty as "easy" } : {}), ...(year ? { year: Number(year) } : {}), ...(active ? { is_active: active === "1" } : {}) },
    ...(q ? { search: { columns: ["text", "explanation", "option_a", "option_b", "option_c", "option_d"], term: q } } : {}),
    order: [{ column: "created_at", ascending: false }],
  });
  const total = await store.count("questions");
  const { page, pageSize, offset } = pageParams(sp, 25);
  const pageRows = rows.slice(offset, offset + pageSize);
  const years = Array.from(new Set(rows.map((r) => r.year).filter((y): y is number => y !== null))).sort((a, b) => b - a);

  return (
    <div>
      <PageHeader title="Question bank" description={`${rows.length} of ${total} questions`} className="mb-5" actions={<><ButtonLink href="/admin/questions/import" variant="secondary" size="sm"><Upload className="h-4 w-4" aria-hidden="true" /> Bulk import CSV</ButtonLink><ButtonLink href="/admin/questions/new" size="sm"><Plus className="h-4 w-4" aria-hidden="true" /> Add question</ButtonLink></>} />
      <FilterBar reset="/admin/questions">
        <FilterInput name="q" placeholder="Search text" defaultValue={q} className="w-56" />
        <FilterSelect name="subject" defaultValue={subject} options={subjects.map((s) => ({ value: s.id, label: s.name }))} allLabel="All subjects" />
        <FilterSelect name="exam" defaultValue={exam} options={exams.map((e) => ({ value: e.id, label: e.short_name }))} allLabel="All exams" />
        <FilterSelect name="difficulty" defaultValue={difficulty} options={["easy", "medium", "hard"].map((d) => ({ value: d, label: DIFFICULTY_LABELS[d] }))} allLabel="Any difficulty" className="w-36" />
        <FilterSelect name="year" defaultValue={year} options={years.map((y) => ({ value: String(y), label: String(y) }))} allLabel="Any year" className="w-28" />
        <FilterSelect name="active" defaultValue={active} options={[{ value: "1", label: "Active" }, { value: "0", label: "Inactive" }]} allLabel="Any status" className="w-32" />
      </FilterBar>
      <Table>
        <thead><tr><Th>Question</Th><Th>Subject</Th><Th>Exam</Th><Th>Difficulty</Th><Th>Marks</Th><Th>Active</Th><Th className="text-right">Actions</Th></tr></thead>
        <tbody>
          {pageRows.length === 0 && <tr><Td colSpan={7} className="text-center text-ink-500">No questions match.</Td></tr>}
          {pageRows.map((r) => (
            <tr key={r.id} className="hover:bg-ink-50/60">
              <Td className="max-w-md"><span className="line-clamp-2 text-ink-900">{r.text}</span><span className="block text-xs text-ink-500">Ans {r.correct_option} · {r.id}{r.year ? ` · ${r.year}` : ""} · {r.language}</span></Td>
              <Td className="text-xs">{subjects.find((s) => s.id === r.subject_id)?.name}</Td>
              <Td className="text-xs">{r.exam_id ? exams.find((e) => e.id === r.exam_id)?.short_name : "—"}</Td>
              <Td><Badge tone={difficultyTone(r.difficulty)}>{DIFFICULTY_LABELS[r.difficulty]}</Badge></Td>
              <Td>{r.marks} / −{r.negative_marks}</Td>
              <Td>
                <form action={toggleQuestionActive}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="value" value={r.is_active ? "0" : "1"} /><SubmitButton variant="ghost" size="sm" className="h-8 px-2"><Badge tone={r.is_active ? "forest" : "neutral"}>{r.is_active ? "Yes" : "No"}</Badge></SubmitButton></form>
              </Td>
              <Td className="text-right">
                <div className="inline-flex items-center gap-1">
                  <ButtonLink href={`/admin/questions/${r.id}/edit`} variant="outline" size="sm"><Pencil className="h-3.5 w-3.5" aria-hidden="true" /> Edit</ButtonLink>
                  <form action={deleteQuestion} className="inline"><input type="hidden" name="id" value={r.id} /><ConfirmButton confirmLabel="Delete">Delete</ConfirmButton></form>
                </div>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Pagination page={page} pageSize={pageSize} total={rows.length} basePath="/admin/questions" params={{ q, subject, exam, difficulty, year, active }} />
    </div>
  );
}
