import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMaterialBySlug } from "@/lib/services/catalog";
import { MaterialDetail } from "@/components/library/material-detail";

export async function generateMetadata(props: PageProps<"/books/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const m = await getMaterialBySlug("book", slug);
  if (!m || !m.is_published) notFound();
  return {
    title: m.title,
    description: m.description.slice(0, 160),
    alternates: { canonical: `/books/${m.slug}` },
    openGraph: { title: m.title, description: m.description.slice(0, 200), type: "book" },
  };
}

export default async function Page(props: PageProps<"/books/[slug]">) {
  const { slug } = await props.params;
  return <MaterialDetail kind="book" slug={slug} />;
}
