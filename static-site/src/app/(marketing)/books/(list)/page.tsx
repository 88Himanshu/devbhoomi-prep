import type { Metadata } from "next";
import { NotebookPen } from "lucide-react";
import { db } from "@/lib/data";
import { getExams, getSubjects } from "@/lib/services/catalog";
import { Container, PageHeader } from "@/components/ui/misc";
import { ButtonLink } from "@/components/ui/button";
import { StaticLibrary } from "@/components/static/static-library";

export const metadata: Metadata = {
  title: "Books for Uttarakhand Government Exams",
  description: "Searchable library of original books for UKPSC, UKSSSC, Uttarakhand Police, Patwari, VDO, Forest Guard and more. Filter by exam, subject, language and year.",
  alternates: { canonical: "/books" },
};

/** Static showcase: the whole catalogue is embedded and filtered in the browser. */
export default async function Page() {
  const [materials, exams, subjects] = await Promise.all([
    (await db()).select("books", { eq: { is_published: true }, order: [{ column: "created_at", ascending: false }] }),
    getExams(),
    getSubjects(),
  ]);
  const years = [...new Set(materials.map((m) => m.year))].sort((a, b) => b - a);
  return (
    <Container className="py-8 sm:py-10">
      <PageHeader
        eyebrow="Digital library"
        title="Books"
        description="Original books and practice workbooks prepared for Uttarakhand government exams. Read online, preview or download."
        actions={<ButtonLink href="/notes" variant="outline" size="sm"><NotebookPen className="h-4 w-4" />Browse Notes</ButtonLink>}
      />
      <StaticLibrary kind="book" materials={materials} subjects={subjects} exams={exams} years={years} />
    </Container>
  );
}
