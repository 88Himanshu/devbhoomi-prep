import { adminDb } from "@/lib/data";
import { QuestionForm } from "@/components/admin/question-form";
export const metadata = { title: "New question" };
export default async function Page() {
  const store = await adminDb();
  const [subjects, exams] = await Promise.all([store.select("subjects", { order: [{ column: "sort_order" }] }), store.select("exams", { order: [{ column: "sort_order" }] })]);
  return <QuestionForm subjects={subjects} exams={exams} />;
}
