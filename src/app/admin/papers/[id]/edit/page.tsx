import { notFound } from "next/navigation";
import { adminDb } from "@/lib/data";
import { PaperForm } from "@/components/admin/paper-form";
export const metadata = { title: "Edit paper" };
export default async function Page(props: PageProps<"/admin/papers/[id]/edit">) {
  const { id } = await props.params;
  const store = await adminDb();
  const [paper, subjects, exams] = await Promise.all([store.getById("previous_year_papers", id), store.select("subjects", { order: [{ column: "sort_order" }] }), store.select("exams", { order: [{ column: "sort_order" }] })]);
  if (!paper) notFound();
  return <PaperForm paper={paper} subjects={subjects} exams={exams} />;
}
