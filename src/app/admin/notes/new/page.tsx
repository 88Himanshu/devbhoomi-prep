import { adminDb } from "@/lib/data";
import { MaterialForm } from "@/components/admin/material-form";
export const metadata = { title: "New note" };
export default async function Page() {
  const store = await adminDb();
  const [subjects, exams] = await Promise.all([store.select("subjects", { order: [{ column: "sort_order" }] }), store.select("exams", { order: [{ column: "sort_order" }] })]);
  return <MaterialForm kind="note" subjects={subjects} exams={exams} />;
}
