import type { Exam, PreviousYearPaper, Subject } from "@/lib/types";
import { savePaper } from "@/lib/admin/papers";
import { ActionForm } from "@/components/admin/action-form";
import { FileField } from "@/components/admin/file-field";
import { FormShell, Grid2, Toggle } from "@/components/admin/shared";
import { Field, Input, Select } from "@/components/ui/form";
import { ButtonLink } from "@/components/ui/button";
import { Alert } from "@/components/ui/misc";
import { PAPER_TYPE_LABELS } from "@/lib/utils";

export function PaperForm({ paper, subjects, exams }: { paper?: PreviousYearPaper | null; subjects: Subject[]; exams: Exam[] }) {
  return (
    <FormShell
      title={paper ? `Edit ${paper.title}` : "New previous-year paper"}
      description="Upload the paper PDF and, optionally, a CSV of its questions to generate a timed mock test."
      aside={
        <Alert tone="info" title="Question CSV">
          Use the same columns as <a className="underline" href="/api/admin/questions/template.csv">the question template</a>. Exam, subject and year are pre-filled from this paper when omitted. Rows with errors block the import so nothing partial is created.
        </Alert>
      }
    >
      <ActionForm action={savePaper} submitLabel={paper ? "Save changes" : "Create paper"} secondary={<ButtonLink href="/admin/papers" variant="ghost">Cancel</ButtonLink>}>
        {paper && <input type="hidden" name="id" value={paper.id} />}
        <div className="space-y-4">
          <Field label="Title" htmlFor="title"><Input id="title" name="title" defaultValue={paper?.title} placeholder="UKSSSC Graduate Level Exam 2021 – Paper" required /></Field>
          <Grid2>
            <Field label="Exam" htmlFor="exam_id"><Select id="exam_id" name="exam_id" defaultValue={paper?.exam_id ?? ""}><option value="">Select…</option>{exams.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}</Select></Field>
            <Field label="Subject (optional)" htmlFor="subject_id"><Select id="subject_id" name="subject_id" defaultValue={paper?.subject_id ?? ""}><option value="">Full paper / mixed</option>{subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</Select></Field>
            <Field label="Year" htmlFor="year"><Input id="year" name="year" type="number" defaultValue={paper?.year ?? new Date().getFullYear() - 1} required /></Field>
            <Field label="Paper type" htmlFor="paper_type"><Select id="paper_type" name="paper_type" defaultValue={paper?.paper_type ?? "prelims"}>{Object.entries(PAPER_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</Select></Field>
            <Field label="Total questions" htmlFor="total_questions"><Input id="total_questions" name="total_questions" type="number" defaultValue={paper?.total_questions ?? 100} /></Field>
            <Field label="Duration (minutes)" htmlFor="duration_minutes"><Input id="duration_minutes" name="duration_minutes" type="number" defaultValue={paper?.duration_minutes ?? 120} /></Field>
            <Field label="Language" htmlFor="language"><Select id="language" name="language" defaultValue={paper?.language ?? "bilingual"}><option value="bilingual">Bilingual</option><option value="en">English</option><option value="hi">Hindi</option></Select></Field>
          </Grid2>
          <Grid2>
            <FileField name="file_path" label="Paper PDF" folder="papers" initialKey={paper?.file_path} />
            <FileField name="questions_csv" label="Questions CSV (optional)" folder="misc" accept=".csv,text/csv" hint="Creates/links a mock test and imports these questions into it." />
          </Grid2>
          <div className="grid gap-2 sm:grid-cols-3">
            <Toggle name="is_premium" label="Premium" defaultChecked={paper?.is_premium ?? false} />
            <Toggle name="is_published" label="Published" defaultChecked={paper?.is_published ?? true} />
            {!paper?.mock_test_id && <Toggle name="convert_to_mock" label="Also create an empty mock test" hint="You can add questions later" />}
          </div>
        </div>
      </ActionForm>
    </FormShell>
  );
}
