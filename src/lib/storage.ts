import "server-only";
import { existsSync, mkdirSync } from "node:fs";
import { readFile, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import { env, getBackend, isStaticSite } from "@/lib/env";

/**
 * File storage for PDFs and uploads.
 *  - demo:     files live under .data/uploads/<key> (bundled samples under public/samples)
 *  - supabase: private Storage bucket; objects are streamed through /api/files with access checks
 * Keys are relative paths like "books/2026/uk-gk-notes.pdf" or "samples/sample-paper.pdf".
 */

const UPLOAD_DIR = path.join(process.cwd(), ".data", "uploads");
const PUBLIC_SAMPLES = path.join(process.cwd(), "public");

export function sanitizeKey(key: string): string {
  const clean = key.replace(/\\/g, "/").split("/").filter((p) => p && p !== "." && p !== "..").join("/");
  if (!clean) throw new Error("Invalid storage key");
  return clean;
}

export function contentTypeFor(key: string): string {
  const ext = key.split(".").pop()?.toLowerCase();
  return ({ pdf: "application/pdf", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp", csv: "text/csv" } as Record<string, string>)[ext ?? ""] ?? "application/octet-stream";
}

export async function putObject(key: string, data: Buffer | Uint8Array, contentType = contentTypeFor(key)): Promise<string> {
  const safe = sanitizeKey(key);
  if (getBackend() === "demo") {
    const full = path.join(UPLOAD_DIR, safe);
    if (!existsSync(path.dirname(full))) mkdirSync(path.dirname(full), { recursive: true });
    await writeFile(full, data);
    return safe;
  }
  const { createSupabaseAdminClient } = await import("@/lib/supabase/server");
  const { error } = await createSupabaseAdminClient().storage.from(env.STORAGE_BUCKET).upload(safe, data, { contentType, upsert: true });
  if (error) throw new Error(error.message);
  return safe;
}

export async function getObject(key: string): Promise<{ data: Buffer; contentType: string } | null> {
  const safe = sanitizeKey(key);
  const contentType = contentTypeFor(safe);
  // Bundled sample files ship with the repo in both modes.
  if (safe.startsWith("samples/")) {
    const full = path.join(PUBLIC_SAMPLES, safe);
    return existsSync(full) ? { data: await readFile(full), contentType } : null;
  }
  if (getBackend() === "demo") {
    const full = path.join(UPLOAD_DIR, safe);
    return existsSync(full) ? { data: await readFile(full), contentType } : null;
  }
  const { createSupabaseAdminClient } = await import("@/lib/supabase/server");
  const { data, error } = await createSupabaseAdminClient().storage.from(env.STORAGE_BUCKET).download(safe);
  if (error || !data) return null;
  return { data: Buffer.from(await data.arrayBuffer()), contentType };
}

export async function deleteObject(key: string): Promise<void> {
  const safe = sanitizeKey(key);
  if (safe.startsWith("samples/")) return;
  if (getBackend() === "demo") {
    const full = path.join(UPLOAD_DIR, safe);
    if (existsSync(full)) await unlink(full);
    return;
  }
  const { createSupabaseAdminClient } = await import("@/lib/supabase/server");
  await createSupabaseAdminClient().storage.from(env.STORAGE_BUCKET).remove([safe]);
}

/** Build a storage key for an admin upload. */
export function uploadKey(folder: "books" | "notes" | "papers" | "misc", filename: string): string {
  const base = filename.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "file";
  return `${folder}/${new Date().getFullYear()}/${Date.now().toString(36)}-${base}`;
}

/** Public URL for serving a stored file through the access-checked route. */
export const fileUrl = (key: string, opts: { download?: boolean } = {}) => {
  const safe = sanitizeKey(key);
  // Static showcase: only the bundled sample files exist, served straight from /public.
  // No basePath here: next/link adds it; plain <iframe>/<img> callers must add NEXT_PUBLIC_BASE_PATH themselves.
  if (isStaticSite()) return safe.startsWith("samples/") ? `/${safe}` : "#";
  return `/api/files/${safe}${opts.download ? "?download=1" : ""}`;
};
