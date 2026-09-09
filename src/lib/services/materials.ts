import "server-only";
import { adminDb, db } from "@/lib/data";
import type { Material, PreviousYearPaper } from "@/lib/types";

export type MaterialKind = "book" | "note";
export const tableFor = (kind: MaterialKind): "books" | "notes" => (kind === "book" ? "books" : "notes");
export const featureFor = (kind: MaterialKind): "books" | "notes" => (kind === "book" ? "books" : "notes");

export async function getRelatedMaterials(material: Material, limit = 4): Promise<Material[]> {
  const rows = await (await db()).select(tableFor(material.kind), {
    eq: { is_published: true, subject_id: material.subject_id },
    order: [{ column: "views", ascending: false }],
    limit: limit + 1,
  });
  return rows.filter((m) => m.id !== material.id).slice(0, limit);
}

export async function incrementViews(material: Material): Promise<void> {
  try {
    await (await adminDb()).update(tableFor(material.kind), material.id, { views: material.views + 1 });
  } catch {
    // non-critical
  }
}

export async function getMaterialsByIds(kind: MaterialKind, ids: string[]): Promise<Material[]> {
  if (!ids.length) return [];
  return (await db()).select(tableFor(kind), { in: { id: ids } });
}

/** Distinct years present in the published catalogue (for filter dropdowns). */
export async function materialYears(kind: MaterialKind): Promise<number[]> {
  const rows = await (await db()).select(tableFor(kind), { eq: { is_published: true } });
  return [...new Set(rows.map((r) => r.year))].sort((a, b) => b - a);
}

export async function paperYears(): Promise<number[]> {
  const rows = await (await db()).select("previous_year_papers", { eq: { is_published: true } });
  return [...new Set(rows.map((r) => r.year))].sort((a, b) => b - a);
}

/**
 * Resolve which catalogue record owns a storage key. Used by /api/files to decide access.
 * Returns the record, its kind, and whether the key is the preview (always public).
 */
export async function findOwnerOfKey(key: string): Promise<
  | { kind: "book" | "note"; record: Material; isPreview: boolean }
  | { kind: "paper"; record: PreviousYearPaper; isPreview: false }
  | null
> {
  const store = await adminDb();
  for (const kind of ["book", "note"] as const) {
    const table = tableFor(kind);
    const byFile = await store.selectOne(table, { eq: { file_path: key } });
    if (byFile) return { kind, record: byFile, isPreview: false };
    const byPreview = await store.selectOne(table, { eq: { preview_path: key } });
    if (byPreview) return { kind, record: byPreview, isPreview: true };
  }
  const paper = await store.selectOne("previous_year_papers", { eq: { file_path: key } });
  if (paper) return { kind: "paper", record: paper, isPreview: false };
  return null;
}

export async function incrementDownloads(owner: NonNullable<Awaited<ReturnType<typeof findOwnerOfKey>>>): Promise<void> {
  try {
    const store = await adminDb();
    if (owner.kind === "paper") {
      await store.update("previous_year_papers", owner.record.id, { downloads: owner.record.downloads + 1 });
    } else {
      await store.update(tableFor(owner.kind), owner.record.id, { downloads: owner.record.downloads + 1 });
    }
  } catch {
    // non-critical
  }
}
