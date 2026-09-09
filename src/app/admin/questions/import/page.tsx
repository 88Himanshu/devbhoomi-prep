import { adminDb } from "@/lib/data";
import { PageHeader, Breadcrumbs } from "@/components/ui/misc";
import { ImportWizard } from "@/components/admin/import-wizard";
export const metadata = { title: "Bulk import questions" };
export default async function ImportPage() {
  const store = await adminDb();
  const [subjects, exams] = await Promise.all([store.select("subjects", { order: [{ column: "sort_order" }] }), store.select("exams", { order: [{ column: "sort_order" }] })]);
  return (
    <div className="space-y-5">
      <Breadcrumbs items={[{ label: "Questions", href: "/admin/questions" }, { label: "Bulk import" }]} />
      <PageHeader title="Bulk import questions" description="Upload a CSV, validate every row, then commit. Nothing is written until you confirm." />
      <ImportWizard subjects={subjects} exams={exams} />
    </div>
  );
}
