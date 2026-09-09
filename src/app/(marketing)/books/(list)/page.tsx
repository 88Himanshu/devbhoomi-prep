import type { Metadata } from "next";
import { LibraryPage } from "@/components/library/library-page";

export const metadata: Metadata = {
  title: "Books for Uttarakhand Government Exams",
  description: "Searchable library of original books and practice workbooks for UKPSC, UKSSSC, Uttarakhand Police, Patwari, VDO, Forest Guard and more. Filter by exam, subject, language and year.",
  alternates: { canonical: "/books" },
};

export default async function Page(props: PageProps<"/books">) {
  const searchParams = await props.searchParams;
  return <LibraryPage kind="book" searchParams={searchParams} />;
}
