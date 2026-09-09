import type { Metadata } from "next";
import { BookOpen } from "lucide-react";
import { db } from "@/lib/data";
import { getExams, getSubjects } from "@/lib/services/catalog";
import { Container, PageHeader } from "@/components/ui/misc";
import { ButtonLink } from "@/components/ui/button";
import { StaticLibrary } from "@/components/static/static-library";

export const metadata: Metadata = {
  title: "Study Notes for Uttarakhand Government Exams",
  description: "Searchable library of original notes for UKPSC, UKSSSC, Uttarakhand Police, Patwari, VDO, Forest Guard and more. Filter by exam, subject, language and year.",
  alternates: { canonical: "/notes" },
};

/** Static showcase: the whole catalogue is embedded and filtered in the browser. */
export default async function Page() {
  const [materials, exams, subjects] = await Promise.all([
    (await db()).select("notes", { eq: { is_published: true }, order: [{ column: "created_at", ascending: false }] }),
    getExams(),
    getSubjects(),
  ]);
  const years = [...new Set(materials.map((m) => m.year))].sort((a, b) => b - a);
  return (
    <Container className="py-8 sm:py-10">
      <PageHeader
        eyebrow="Digital library"
        title="Study Notes"
        description="Concise, exam-focused notes for quick revision across UKPSC, UKSSSC, Police and other Uttarakhand exams."
        actions={<ButtonLink href="/books" variant="outline" size="sm"><BookOpen className="h-4 w-4" />Browse Books</ButtonLink>}
      />
      <StaticLibrary kind="note" materials={materials} subjects={subjects} exams={exams} years={years} />
    </Container>
  );
}
