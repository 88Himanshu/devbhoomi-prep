"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { adminDb } from "@/lib/data";
import { requireAdmin } from "@/lib/auth/session";
import { deleteObject } from "@/lib/storage";
import { slugify } from "@/lib/utils";
import type { Material } from "@/lib/types";
import { bool, fail, list, num, opt, str, toastRedirect, zodErrors, type ActionState } from "./helpers";

const kindOf = (fd: FormData): "book" | "note" => (str(fd, "kind") === "note" ? "note" : "book");
const tableOf = (kind: "book" | "note") => (kind === "book" ? ("books" as const) : ("notes" as const));
const pathOf = (kind: "book" | "note") => `/admin/${tableOf(kind)}`;

const schema = z.object({
  title: z.string().min(3).max(160),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, "lowercase letters, numbers and dashes only"),
  description: z.string().max(4000),
  subject_id: z.string().min(1, "Pick a subject"),
  author: z.string().min(1),
  language: z.enum(["en", "hi", "bilingual"]),
  year: z.number().int().min(1990).max(2100),
  pages: z.number().int().min(0).max(5000),
  source_license: z.enum(["original", "licensed", "public_domain", "authorized"]),
  cover_color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
});

export async function saveMaterial(prev: ActionState | null, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const kind = kindOf(formData);
  const table = tableOf(kind);
  const id = str(formData, "id") || null;
  const parsed = schema.safeParse({
    title: str(formData, "title"), slug: str(formData, "slug") || slugify(str(formData, "title")),
    description: str(formData, "description"), subject_id: str(formData, "subject_id"), author: str(formData, "author") || "Devbhoomi Prep Editorial Team",
    language: str(formData, "language") || "en", year: num(formData, "year", new Date().getFullYear()), pages: num(formData, "pages"),
    source_license: str(formData, "source_license") || "original", cover_color: str(formData, "cover_color") || "#163e86",
  });
  if (!parsed.success) return fail(zodErrors(parsed.error));
  const exam_ids = list(formData, "exam_ids");
  if (!exam_ids.length) return fail({ exam_ids: "Assign at least one exam" });
  const store = await adminDb();
  const dup = await store.selectOne(table, { eq: { slug: parsed.data.slug } });
  if (dup && dup.id !== id) return fail({ slug: "Slug already in use" });
  const acknowledged = bool(formData, "rights_ack");
  if (!id && !acknowledged) return fail({ rights_ack: "Confirm the platform has the right to distribute this file" });

  const payload: Omit<Material, "id" | "created_at" | "downloads" | "views"> = {
    kind,
    ...parsed.data,
    exam_ids,
    file_path: opt(formData, "file_path"),
    preview_path: opt(formData, "preview_path"),
    is_premium: bool(formData, "is_premium"),
    is_published: bool(formData, "is_published"),
    is_featured: bool(formData, "is_featured"),
  };
  if (id) {
    const existing = await store.getById(table, id);
    if (!existing) return { ok: false, error: "Not found" };
    if (existing.file_path && existing.file_path !== payload.file_path) await deleteObject(existing.file_path).catch(() => undefined);
    await store.update(table, id, payload);
  } else {
    await store.insert(table, { ...payload, downloads: 0, views: 0 });
  }
  revalidatePath(pathOf(kind));
  revalidatePath(`/${table}`);
  toastRedirect(pathOf(kind), "ok", `${payload.title} ${id ? "updated" : "created"}`);
}

export async function deleteMaterial(formData: FormData) {
  await requireAdmin();
  const kind = kindOf(formData);
  const table = tableOf(kind);
  const id = str(formData, "id");
  const store = await adminDb();
  const row = await store.getById(table, id);
  if (!row) toastRedirect(pathOf(kind), "err", "Not found");
  if (row.file_path) await deleteObject(row.file_path).catch(() => undefined);
  if (row.preview_path) await deleteObject(row.preview_path).catch(() => undefined);
  await store.delete(table, id);
  await store.deleteWhere("bookmarks", { eq: { item_type: kind, item_id: id } });
  revalidatePath(pathOf(kind));
  revalidatePath(`/${table}`);
  toastRedirect(pathOf(kind), "ok", `${row.title} deleted`);
}

export async function toggleMaterialFlag(formData: FormData) {
  await requireAdmin();
  const kind = kindOf(formData);
  const table = tableOf(kind);
  const field = (["is_premium", "is_published", "is_featured"] as const).find((f) => f === str(formData, "field")) ?? "is_published";
  const store = await adminDb();
  await store.update(table, str(formData, "id"), { [field]: str(formData, "value") === "1" });
  revalidatePath(pathOf(kind));
  revalidatePath(`/${table}`);
  toastRedirect(str(formData, "return") || pathOf(kind), "ok", "Updated");
}

export async function saveFeaturedMaterials(formData: FormData) {
  await requireAdmin();
  const store = await adminDb();
  for (const table of ["books", "notes"] as const) {
    const rows = await store.select(table);
    for (const r of rows) {
      const want = bool(formData, `featured_${table}_${r.id}`);
      if (want !== r.is_featured) await store.update(table, r.id, { is_featured: want });
    }
  }
  revalidatePath("/");
  toastRedirect("/admin/homepage", "ok", "Featured materials saved");
}
