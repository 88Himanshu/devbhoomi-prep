import type { Exam, Question, Subject } from "@/lib/types";
import { Grid2, Toggle } from "@/components/admin/shared";
import { Field, Input, Select, Textarea } from "@/components/ui/form";

/** Question form fields — shared by the question bank editor and the inline mock-test form. */
export function QuestionFields({ question, subjects, exams, defaults, compact }: {
  question?: Question | null; subjects: Subject[]; exams: Exam[]; defaults?: Partial<Question>; compact?: boolean;
}) {
  const q = question ?? defaults ?? {};
  return (
    <div className="space-y-4">
      <Field label="Question" htmlFor="text"><Textarea id="text" name="text" rows={compact ? 2 : 3} defaultValue={q.text} required /></Field>
      <Grid2>
        {(["a", "b", "c", "d"] as const).map((k) => (
          <Field key={k} label={`Option ${k.toUpperCase()}`} htmlFor={`option_${k}`}><Input id={`option_${k}`} name={`option_${k}`} defaultValue={q[`option_${k}`]} required /></Field>
        ))}
      </Grid2>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Correct option" htmlFor="correct_option"><Select id="correct_option" name="correct_option" defaultValue={q.correct_option ?? "A"}>{["A", "B", "C", "D"].map((o) => <option key={o}>{o}</option>)}</Select></Field>
        <Field label="Subject" htmlFor="subject_id"><Select id="subject_id" name="subject_id" defaultValue={q.subject_id ?? ""}><option value="">Select…</option>{subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</Select></Field>
        <Field label="Exam (optional)" htmlFor="exam_id"><Select id="exam_id" name="exam_id" defaultValue={q.exam_id ?? ""}><option value="">Any</option>{exams.map((e) => <option key={e.id} value={e.id}>{e.short_name}</option>)}</Select></Field>
        <Field label="Difficulty" htmlFor="difficulty"><Select id="difficulty" name="difficulty" defaultValue={q.difficulty ?? "medium"}><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></Select></Field>
        <Field label="Year (optional)" htmlFor="year"><Input id="year" name="year" type="number" defaultValue={q.year ?? ""} /></Field>
        <Field label="Language" htmlFor="language"><Select id="language" name="language" defaultValue={q.language ?? "en"}><option value="en">English</option><option value="hi">Hindi</option><option value="bilingual">Bilingual</option></Select></Field>
        <Field label="Marks" htmlFor="marks"><Input id="marks" name="marks" type="number" step="0.25" defaultValue={q.marks ?? 1} /></Field>
        <Field label="Negative marks" htmlFor="negative_marks"><Input id="negative_marks" name="negative_marks" type="number" step="0.25" defaultValue={q.negative_marks ?? 0.25} /></Field>
      </div>
      <Field label="Explanation" htmlFor="explanation"><Textarea id="explanation" name="explanation" rows={compact ? 2 : 4} defaultValue={q.explanation} /></Field>
      {question && <Toggle name="is_active" label="Active (available for tests)" defaultChecked={question.is_active} />}
    </div>
  );
}
