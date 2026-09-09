import { notFound } from "next/navigation";
import { adminDb } from "@/lib/data";
import { ExamForm } from "@/components/admin/exam-form";
export const metadata = { title: "Edit exam" };
export default async function EditExamPage(props: PageProps<"/admin/exams/[id]/edit">) {
  const { id } = await props.params;
  const exam = await (await adminDb()).getById("exams", id);
  if (!exam) notFound();
  return <ExamForm exam={exam} />;
}
