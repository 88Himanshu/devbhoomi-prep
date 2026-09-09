import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMaterialBySlug } from "@/lib/services/catalog";
import { MaterialDetail } from "@/components/library/material-detail";

export async function generateMetadata(props: PageProps<"/notes/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const m = await getMaterialBySlug("note", slug);
  if (!m || !m.is_published) notFound();
  return {
    title: m.title,
    description: m.description.slice(0, 160),
    alternates: { canonical: `/notes/${m.slug}` },
    openGraph: { title: m.title, description: m.description.slice(0, 200), type: "article" },
  };
}

export default async function Page(props: PageProps<"/notes/[slug]">) {
  const { slug } = await props.params;
  return <MaterialDetail kind="note" slug={slug} />;
}
