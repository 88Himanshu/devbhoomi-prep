import type { Exam, MockTest, Subject } from "@/lib/types";
import { saveMockTest } from "@/lib/admin/mock-tests";
import { ActionForm } from "@/components/admin/action-form";
import { FormShell, Grid2, Toggle } from "@/components/admin/shared";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { ButtonLink } from "@/components/ui/button";

export function MockTestForm({ mock, subjects, exams }: { mock?: MockTest | null; subjects: Subject[]; exams: Exam[] }) {
  return (
    <FormShell title={mock ? `Edit ${mock.title}` : "New mock test"} description="Set the test rules here; manage its questions on the next screen.">
      <ActionForm action={saveMockTest} submitLabel={mock ? "Save changes" : "Create & add questions"} secondary={<ButtonLink href="/admin/mock-tests" variant="ghost">Cancel</ButtonLink>}>
        {mock && <input type="hidden" name="id" value={mock.id} />}
        <div className="space-y-4">
          <Field label="Title" htmlFor="title"><Input id="title" name="title" defaultValue={mock?.title} required /></Field>
          <Grid2>
            <Field label="Slug" htmlFor="slug" hint="Blank = generated from title"><Input id="slug" name="slug" defaultValue={mock?.slug} /></Field>
            <Field label="Exam" htmlFor="exam_id"><Select id="exam_id" name="exam_id" defaultValue={mock?.exam_id ?? ""}><option value="">Select…</option>{exams.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}</Select></Field>
            <Field label="Subject" htmlFor="subject_id"><Select id="subject_id" name="subject_id" defaultValue={mock?.subject_id ?? ""}><option value="">Full-length / mixed</option>{subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</Select></Field>
            <Field label="Difficulty" htmlFor="difficulty"><Select id="difficulty" name="difficulty" defaultValue={mock?.difficulty ?? "medium"}><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></Select></Field>
            <Field label="Duration (minutes)" htmlFor="duration_minutes"><Input id="duration_minutes" name="duration_minutes" type="number" defaultValue={mock?.duration_minutes ?? 60} /></Field>
            <Field label="Negative marks per wrong answer" htmlFor="negative_marks"><Input id="negative_marks" name="negative_marks" type="number" step="0.25" defaultValue={mock?.negative_marks ?? 0.25} /></Field>
          </Grid2>
          <Field label="Description" htmlFor="description"><Textarea id="description" name="description" rows={3} defaultValue={mock?.description} /></Field>
          <div className="grid gap-2 sm:grid-cols-3">
            <Toggle name="is_premium" label="Premium" defaultChecked={mock?.is_premium ?? true} />
            <Toggle name="is_published" label="Published" hint="Needs at least one question" defaultChecked={mock?.is_published ?? false} />
            <Toggle name="is_pyp" label="Previous-year paper" defaultChecked={mock?.is_pyp ?? false} />
          </div>
          {mock && <p className="text-xs text-ink-500">Marks and question count are computed automatically: {mock.question_count} questions · {mock.total_marks} marks · {mock.attempts_count} attempts.</p>}
        </div>
      </ActionForm>
    </FormShell>
  );
}
