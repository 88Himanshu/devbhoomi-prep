import type { Metadata } from "next";
import { LibraryPage } from "@/components/library/library-page";

export const metadata: Metadata = {
  title: "Study Notes for Uttarakhand Government Exams",
  description: "Searchable library of original revision notes for UKPSC, UKSSSC, Uttarakhand Police, Patwari, VDO, Forest Guard and more. Filter by exam, subject, language and year.",
  alternates: { canonical: "/notes" },
};

export default async function Page(props: PageProps<"/notes">) {
  const searchParams = await props.searchParams;
  return <LibraryPage kind="note" searchParams={searchParams} />;
}
