import { notFound } from "next/navigation";
import { adminDb } from "@/lib/data";
import { MaterialForm } from "@/components/admin/material-form";
export const metadata = { title: "Edit note" };
export default async function Page(props: PageProps<"/admin/notes/[id]/edit">) {
  const { id } = await props.params;
  const store = await adminDb();
  const [material, subjects, exams] = await Promise.all([store.getById("notes", id), store.select("subjects", { order: [{ column: "sort_order" }] }), store.select("exams", { order: [{ column: "sort_order" }] })]);
  if (!material) notFound();
  return <MaterialForm kind="note" material={material} subjects={subjects} exams={exams} />;
}
