import { notFound } from "next/navigation";
import { adminDb } from "@/lib/data";
import { MockTestForm } from "@/components/admin/mock-test-form";
export const metadata = { title: "Edit mock test" };
export default async function Page(props: PageProps<"/admin/mock-tests/[id]/edit">) {
  const { id } = await props.params;
  const store = await adminDb();
  const [mock, subjects, exams] = await Promise.all([store.getById("mock_tests", id), store.select("subjects", { order: [{ column: "sort_order" }] }), store.select("exams", { order: [{ column: "sort_order" }] })]);
  if (!mock) notFound();
  return <MockTestForm mock={mock} subjects={subjects} exams={exams} />;
}
