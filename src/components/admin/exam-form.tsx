import type { Exam } from "@/lib/types";
import { saveExam } from "@/lib/admin/exams";
import { ActionForm } from "@/components/admin/action-form";
import { JsonField } from "@/components/admin/json-field";
import { FormShell, Grid2, Toggle } from "@/components/admin/shared";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { ButtonLink } from "@/components/ui/button";

const ICONS = ["Landmark", "Building2", "Shield", "MapPinned", "Tractor", "FileText", "TreePine", "Layers", "GraduationCap", "BookOpenCheck", "Briefcase"];
const CATEGORIES = ["State PSC", "Subordinate Services", "Police", "Revenue", "Rural Development", "Clerical", "Forest", "Group C", "Teaching", "Other"];

const SYLLABUS_EXAMPLE = JSON.stringify([{ title: "General Studies", topics: ["Indian polity", "Uttarakhand geography", "Current affairs"] }], null, 2);
const PATTERN_EXAMPLE = JSON.stringify([{ stage: "Prelims", subject: "General Studies", questions: 150, marks: 150, duration: "2 hours", negative_marking: "1/4 mark" }], null, 2);
const PLAN_EXAMPLE = JSON.stringify([{ week: 1, focus: "Uttarakhand GK basics", tasks: ["Read history notes", "Attempt 1 subject mock"] }], null, 2);

export function ExamForm({ exam }: { exam?: Exam | null }) {
  return (
    <FormShell title={exam ? `Edit ${exam.name}` : "New exam"} description="Exam pages are generated from these fields at /exams/<slug>.">
      <ActionForm action={saveExam} submitLabel={exam ? "Save changes" : "Create exam"} secondary={<ButtonLink href="/admin/exams" variant="ghost">Cancel</ButtonLink>}>
        {exam && <input type="hidden" name="id" value={exam.id} />}
        <div className="space-y-4">
          <Grid2>
            <Field label="Name" htmlFor="name"><Input id="name" name="name" defaultValue={exam?.name} required /></Field>
            <Field label="Short name" htmlFor="short_name"><Input id="short_name" name="short_name" defaultValue={exam?.short_name} required /></Field>
            <Field label="Slug" htmlFor="slug" hint="Leave blank to generate from the name"><Input id="slug" name="slug" defaultValue={exam?.slug} placeholder="ukpsc" /></Field>
            <Field label="Conducting body" htmlFor="conducting_body"><Input id="conducting_body" name="conducting_body" defaultValue={exam?.conducting_body} required /></Field>
            <Field label="Category" htmlFor="category"><Input id="category" name="category" list="exam-categories" defaultValue={exam?.category} required /><datalist id="exam-categories">{CATEGORIES.map((c) => <option key={c} value={c} />)}</datalist></Field>
            <Field label="Icon" htmlFor="icon"><Select id="icon" name="icon" defaultValue={exam?.icon ?? "Landmark"}>{ICONS.map((i) => <option key={i}>{i}</option>)}</Select></Field>
            <Field label="Sort order" htmlFor="sort_order"><Input id="sort_order" name="sort_order" type="number" defaultValue={exam?.sort_order ?? 99} /></Field>
          </Grid2>
          <Field label="Tagline" htmlFor="tagline"><Input id="tagline" name="tagline" defaultValue={exam?.tagline} maxLength={160} /></Field>
          <Field label="Overview" htmlFor="overview" hint="Separate paragraphs with a blank line"><Textarea id="overview" name="overview" rows={6} defaultValue={exam?.overview} /></Field>
          <Field label="Eligibility" htmlFor="eligibility" hint="One bullet per line"><Textarea id="eligibility" name="eligibility" rows={5} defaultValue={exam?.eligibility.join("\n")} /></Field>
          <JsonField name="syllabus" label="Syllabus (JSON)" initial={exam?.syllabus ?? []} example={SYLLABUS_EXAMPLE} hint='Array of { "title", "topics": [] }' />
          <JsonField name="exam_pattern" label="Exam pattern (JSON)" initial={exam?.exam_pattern ?? []} example={PATTERN_EXAMPLE} rows={8} hint='Array of { "stage", "subject", "questions", "marks", "duration", "negative_marking" }' />
          <JsonField name="study_plan" label="Study plan (JSON)" initial={exam?.study_plan ?? []} example={PLAN_EXAMPLE} rows={8} hint='Array of { "week", "focus", "tasks": [] }' />
          <Field label="Important question ids" htmlFor="important_question_ids" hint="Comma-separated question ids from the question bank"><Input id="important_question_ids" name="important_question_ids" defaultValue={exam?.important_question_ids.join(", ")} /></Field>
          <Grid2>
            <Toggle name="is_featured" label="Featured on homepage" defaultChecked={exam?.is_featured ?? false} />
            <Toggle name="is_active" label="Active (visible to students)" defaultChecked={exam?.is_active ?? true} />
          </Grid2>
        </div>
      </ActionForm>
    </FormShell>
  );
}
