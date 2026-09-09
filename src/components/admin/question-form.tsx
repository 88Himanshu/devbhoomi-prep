import type { Exam, Question, Subject } from "@/lib/types";
import { saveQuestion } from "@/lib/admin/questions";
import { ActionForm } from "@/components/admin/action-form";
import { FormShell } from "@/components/admin/shared";
import { QuestionFields } from "@/components/admin/question-fields";
import { ButtonLink } from "@/components/ui/button";

export function QuestionForm({ question, subjects, exams, returnTo }: { question?: Question | null; subjects: Subject[]; exams: Exam[]; returnTo?: string }) {
  const back = returnTo ?? "/admin/questions";
  return (
    <FormShell title={question ? "Edit question" : "New question"} description="Four options, one correct answer, and an explanation shown in solutions.">
      <ActionForm action={saveQuestion} submitLabel={question ? "Save changes" : "Create question"} secondary={<ButtonLink href={back} variant="ghost">Cancel</ButtonLink>}>
        {question && <input type="hidden" name="id" value={question.id} />}
        <input type="hidden" name="return" value={back} />
        <QuestionFields question={question} subjects={subjects} exams={exams} />
      </ActionForm>
    </FormShell>
  );
}
