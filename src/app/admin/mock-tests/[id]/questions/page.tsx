import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { adminDb } from "@/lib/data";
import { addQuestionsToMock, createQuestionInMock, moveQuestionInMock, removeQuestionFromMock } from "@/lib/admin/mock-tests";
import { sp1 } from "@/lib/admin/helpers";
import { DIFFICULTY_LABELS } from "@/lib/utils";
import { Breadcrumbs, PageHeader, Stat } from "@/components/ui/misc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, difficultyTone } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/form";
import { Tabs, TabList, Tab, TabPanel } from "@/components/ui/tabs";
import { ActionForm } from "@/components/admin/action-form";
import { SubmitButton } from "@/components/admin/confirm-button";
import { FilterBar, FilterInput, FilterSelect } from "@/components/admin/shared";
import { QuestionFields } from "@/components/admin/question-fields";

export const metadata = { title: "Manage test questions" };

export default async function MockQuestionsPage(props: PageProps<"/admin/mock-tests/[id]/questions">) {
  const { id } = await props.params;
  const sp = await props.searchParams;
  const store = await adminDb();
  const mock = await store.getById("mock_tests", id);
  if (!mock) notFound();
  const [links, subjects, exams] = await Promise.all([
    store.select("mock_test_questions", { eq: { mock_test_id: id }, order: [{ column: "sort_order" }] }),
    store.select("subjects", { order: [{ column: "sort_order" }] }),
    store.select("exams", { order: [{ column: "sort_order" }] }),
  ]);
  const current = links.length ? await store.select("questions", { in: { id: links.map((l) => l.question_id) } }) : [];
  const byId = new Map(current.map((q) => [q.id, q]));
  const ordered = links.map((l) => ({ link: l, q: byId.get(l.question_id) })).filter((x) => x.q);
  const have = new Set(links.map((l) => l.question_id));

  // Bank filters
  const bq = sp1(sp.q), bsubject = sp1(sp.subject) || mock.subject_id || "", bexam = sp1(sp.exam), bdiff = sp1(sp.difficulty);
  const bank = (await store.select("questions", {
    eq: { is_active: true, ...(bsubject ? { subject_id: bsubject } : {}), ...(bexam ? { exam_id: bexam } : {}), ...(bdiff ? { difficulty: bdiff as "easy" } : {}) },
    ...(bq ? { search: { columns: ["text", "explanation"], term: bq } } : {}),
    order: [{ column: "created_at", ascending: false }],
    limit: 60,
  })).filter((q) => !have.has(q.id));
  const sname = (sid: string) => subjects.find((s) => s.id === sid)?.name ?? sid;
  const base = `/admin/mock-tests/${id}/questions`;

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Mock tests", href: "/admin/mock-tests" }, { label: mock.title }]} />
      <PageHeader title={mock.title} description={`${exams.find((e) => e.id === mock.exam_id)?.short_name} · ${mock.subject_id ? sname(mock.subject_id) : "Full-length"} · ${mock.duration_minutes} min`} actions={<><ButtonLink href={`/admin/mock-tests/${id}/edit`} variant="outline" size="sm">Edit settings</ButtonLink><ButtonLink href={`/mock-tests/${mock.slug}`} variant="ghost" size="sm" target="_blank">Preview</ButtonLink></>} />
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Questions" value={mock.question_count} />
        <Stat label="Total marks" value={mock.total_marks} tone="forest" />
        <Stat label="Status" value={mock.is_published ? "Published" : "Draft"} tone={mock.is_published ? "forest" : "saffron"} hint={!mock.is_published && mock.question_count > 0 ? <Link href="/admin/mock-tests" className="text-brand-700">Publish from the list →</Link> : undefined} />
      </div>

      <Card>
        <CardHeader><CardTitle>Questions in this test ({ordered.length})</CardTitle></CardHeader>
        <CardContent className="px-0 pb-0">
          {ordered.length === 0 && <p className="px-5 pb-5 text-sm text-ink-500">No questions yet. Add from the bank or create new ones below.</p>}
          <ol className="divide-y divide-ink-100">
            {ordered.map(({ link, q }, i) => (
              <li key={link.id} className="flex gap-3 px-5 py-3">
                <span className="w-7 shrink-0 pt-0.5 text-sm font-semibold text-ink-500">{i + 1}.</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-ink-900">{q!.text}</p>
                  <p className="mt-1 text-xs text-ink-500">Ans {q!.correct_option} · {sname(q!.subject_id)} · <Badge tone={difficultyTone(q!.difficulty)}>{DIFFICULTY_LABELS[q!.difficulty]}</Badge> · {q!.marks} mark · <Link href={`/admin/questions/${q!.id}/edit?return=${encodeURIComponent(base)}`} className="text-brand-700">edit</Link></p>
                </div>
                <div className="flex shrink-0 items-start gap-0.5">
                  <MoveForm mockId={id} qid={q!.id} dir="up" disabled={i === 0} />
                  <MoveForm mockId={id} qid={q!.id} dir="down" disabled={i === ordered.length - 1} />
                  <form action={removeQuestionFromMock}><input type="hidden" name="mock_test_id" value={id} /><input type="hidden" name="question_id" value={q!.id} /><SubmitButton variant="ghost" size="icon" className="h-8 w-8 text-red-600" aria-label="Remove"><Trash2 className="h-4 w-4" /></SubmitButton></form>
                </div>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Tabs defaultValue="bank">
        <TabList><Tab value="bank">Add from question bank</Tab><Tab value="new">Add new question</Tab></TabList>
        <TabPanel value="bank">
          <FilterBar action={base} reset={base}>
            <FilterInput name="q" placeholder="Search question text" defaultValue={bq} className="w-64" />
            <FilterSelect name="subject" defaultValue={bsubject} options={subjects.map((s) => ({ value: s.id, label: s.name }))} allLabel="All subjects" />
            <FilterSelect name="exam" defaultValue={bexam} options={exams.map((e) => ({ value: e.id, label: e.short_name }))} allLabel="All exams" />
            <FilterSelect name="difficulty" defaultValue={bdiff} options={["easy", "medium", "hard"].map((d) => ({ value: d, label: DIFFICULTY_LABELS[d] }))} allLabel="Any difficulty" className="w-36" />
          </FilterBar>
          <form action={addQuestionsToMock}>
            <input type="hidden" name="mock_test_id" value={id} />
            <Card>
              <CardHeader><CardTitle>{bank.length} available question{bank.length === 1 ? "" : "s"} (showing up to 60)</CardTitle><SubmitButton size="sm">Add selected</SubmitButton></CardHeader>
              <CardContent className="px-0 pb-0">
                {bank.length === 0 && <p className="px-5 pb-5 text-sm text-ink-500">No unused questions match these filters.</p>}
                <ul className="max-h-[32rem] divide-y divide-ink-100 overflow-y-auto scrollbar-thin">
                  {bank.map((q) => (
                    <li key={q.id}>
                      <label className="flex cursor-pointer gap-3 px-5 py-2.5 hover:bg-ink-50">
                        <Checkbox name="question_ids" value={q.id} className="mt-1" />
                        <span className="min-w-0"><span className="block text-sm text-ink-900">{q.text}</span><span className="block text-xs text-ink-500">{sname(q.subject_id)} · {DIFFICULTY_LABELS[q.difficulty]} · {q.exam_id ? exams.find((e) => e.id === q.exam_id)?.short_name : "any exam"}{q.year ? ` · ${q.year}` : ""}</span></span>
                      </label>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </form>
        </TabPanel>
        <TabPanel value="new">
          <Card>
            <CardHeader><CardTitle>Create a question and add it to this test</CardTitle></CardHeader>
            <CardContent>
              <ActionForm action={createQuestionInMock} submitLabel="Create & add">
                <input type="hidden" name="mock_test_id" value={id} />
                <QuestionFields subjects={subjects} exams={exams} defaults={{ subject_id: mock.subject_id ?? undefined, exam_id: mock.exam_id, negative_marks: mock.negative_marks }} compact />
              </ActionForm>
            </CardContent>
          </Card>
        </TabPanel>
      </Tabs>
    </div>
  );
}

function MoveForm({ mockId, qid, dir, disabled }: { mockId: string; qid: string; dir: "up" | "down"; disabled: boolean }) {
  return (
    <form action={moveQuestionInMock}>
      <input type="hidden" name="mock_test_id" value={mockId} /><input type="hidden" name="question_id" value={qid} /><input type="hidden" name="dir" value={dir} />
      <SubmitButton variant="ghost" size="icon" className="h-8 w-8" disabled={disabled} aria-label={`Move ${dir}`}>{dir === "up" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}</SubmitButton>
    </form>
  );
}
