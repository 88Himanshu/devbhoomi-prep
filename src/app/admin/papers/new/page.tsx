import { adminDb } from "@/lib/data";
import { PaperForm } from "@/components/admin/paper-form";
export const metadata = { title: "New paper" };
export default async function Page() {
  const store = await adminDb();
  const [subjects, exams] = await Promise.all([store.select("subjects", { order: [{ column: "sort_order" }] }), store.select("exams", { order: [{ column: "sort_order" }] })]);
  return <PaperForm subjects={subjects} exams={exams} />;
}
