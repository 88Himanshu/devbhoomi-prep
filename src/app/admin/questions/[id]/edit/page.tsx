import { notFound } from "next/navigation";
import { adminDb } from "@/lib/data";
import { sp1 } from "@/lib/admin/helpers";
import { QuestionForm } from "@/components/admin/question-form";
export const metadata = { title: "Edit question" };
export default async function Page(props: PageProps<"/admin/questions/[id]/edit">) {
  const { id } = await props.params;
  const sp = await props.searchParams;
  const store = await adminDb();
  const [question, subjects, exams] = await Promise.all([store.getById("questions", id), store.select("subjects", { order: [{ column: "sort_order" }] }), store.select("exams", { order: [{ column: "sort_order" }] })]);
  if (!question) notFound();
  const ret = sp1(sp.return);
  return <QuestionForm question={question} subjects={subjects} exams={exams} returnTo={ret.startsWith("/admin") ? ret : undefined} />;
}
