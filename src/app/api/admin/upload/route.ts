import { apiAdmin } from "@/lib/auth/session";
import { putObject, uploadKey } from "@/lib/storage";

const MAX_BYTES = 25 * 1024 * 1024;
const ALLOWED: Record<string, string[]> = {
  "application/pdf": [".pdf"],
  "text/csv": [".csv"],
  "application/vnd.ms-excel": [".csv"],
  "text/plain": [".csv"],
};
const FOLDERS = new Set(["books", "notes", "papers", "misc"]);

/** Admin file upload (PDF / CSV) → storage key. Used by <FileField/>. */
export async function POST(req: Request) {
  const auth = await apiAdmin();
  if ("error" in auth) return auth.error;
  const form = await req.formData();
  const file = form.get("file");
  const folder = String(form.get("folder") ?? "misc");
  if (!(file instanceof File)) return Response.json({ error: "No file provided" }, { status: 400 });
  if (!FOLDERS.has(folder)) return Response.json({ error: "Invalid folder" }, { status: 400 });
  if (file.size > MAX_BYTES) return Response.json({ error: "File exceeds 25 MB" }, { status: 413 });
  const ext = "." + (file.name.split(".").pop()?.toLowerCase() ?? "");
  const okType = Object.entries(ALLOWED).some(([mime, exts]) => (file.type === mime || file.type === "") && exts.includes(ext));
  if (!okType) return Response.json({ error: "Only PDF or CSV files are allowed" }, { status: 415 });
  const buf = Buffer.from(await file.arrayBuffer());
  if (ext === ".pdf" && buf.subarray(0, 5).toString() !== "%PDF-") return Response.json({ error: "File is not a valid PDF" }, { status: 415 });
  const key = await putObject(uploadKey(folder as "books" | "notes" | "papers" | "misc", file.name), buf, ext === ".pdf" ? "application/pdf" : "text/csv");
  return Response.json({ key, size: file.size, name: file.name });
}
