import { adminDb } from "@/lib/data";
import { MockTestForm } from "@/components/admin/mock-test-form";
export const metadata = { title: "New mock test" };
export default async function Page() {
  const store = await adminDb();
  const [subjects, exams] = await Promise.all([store.select("subjects", { order: [{ column: "sort_order" }] }), store.select("exams", { order: [{ column: "sort_order" }] })]);
  return <MockTestForm subjects={subjects} exams={exams} />;
}
