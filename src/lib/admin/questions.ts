"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { adminDb } from "@/lib/data";
import { requireAdmin } from "@/lib/auth/session";
import { getObject, deleteObject } from "@/lib/storage";
import type { Question } from "@/lib/types";
import { commitImport, parseCsv, validateRows, type ImportPreview } from "@/lib/services/questions-import";
import { bool, fail, num, opt, optNum, str, toastRedirect, zodErrors, type ActionState } from "./helpers";

const schema = z.object({
  text: z.string().min(5).max(2000),
  option_a: z.string().min(1), option_b: z.string().min(1), option_c: z.string().min(1), option_d: z.string().min(1),
  correct_option: z.enum(["A", "B", "C", "D"]),
  explanation: z.string().max(4000),
  subject_id: z.string().min(1, "Pick a subject"),
  exam_id: z.string().nullable(),
  year: z.number().int().min(1990).max(2100).nullable(),
  difficulty: z.enum(["easy", "medium", "hard"]),
  marks: z.number().positive().max(20),
  negative_marks: z.number().min(0).max(20),
  language: z.enum(["en", "hi", "bilingual"]),
});

/** Shared validator+writer used by the questions page and the mock test editor. */
export async function saveQuestionRow(formData: FormData): Promise<ActionState & { question?: Question }> {
  const id = str(formData, "id") || null;
  const parsed = schema.safeParse({
    text: str(formData, "text"), option_a: str(formData, "option_a"), option_b: str(formData, "option_b"), option_c: str(formData, "option_c"), option_d: str(formData, "option_d"),
    correct_option: str(formData, "correct_option").toUpperCase(), explanation: str(formData, "explanation"), subject_id: str(formData, "subject_id"),
    exam_id: opt(formData, "exam_id"), year: optNum(formData, "year"), difficulty: str(formData, "difficulty") || "medium",
    marks: num(formData, "marks", 1), negative_marks: num(formData, "negative_marks", 0.25), language: str(formData, "language") || "en",
  });
  if (!parsed.success) return fail(zodErrors(parsed.error));
  const store = await adminDb();
  const payload = { ...parsed.data, is_active: formData.has("is_active") ? bool(formData, "is_active") : true };
  const question = id ? await store.update("questions", id, payload) : await store.insert("questions", payload);
  return { ok: true, question };
}

export async function saveQuestion(prev: ActionState | null, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const res = await saveQuestionRow(formData);
  if (!res.ok) return res;
  revalidatePath("/admin/questions");
  toastRedirect(str(formData, "return") || "/admin/questions", "ok", `Question ${str(formData, "id") ? "updated" : "created"}`);
}

export async function deleteQuestion(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  const store = await adminDb();
  const links = await store.select("mock_test_questions", { eq: { question_id: id } });
  const answered = await store.count("test_answers", { eq: { question_id: id } });
  if (answered && !bool(formData, "force")) {
    // Preserve history: deactivate instead of deleting.
    await store.update("questions", id, { is_active: false });
    toastRedirect("/admin/questions", "ok", "Question has student answers, so it was deactivated instead of deleted");
  }
  for (const l of links) await store.delete("mock_test_questions", l.id);
  await store.delete("questions", id);
  await store.deleteWhere("bookmarks", { eq: { item_type: "question", item_id: id } });
  const { recomputeMockTest } = await import("./mock-tests");
  for (const mockId of new Set(links.map((l) => l.mock_test_id))) await recomputeMockTest(mockId);
  revalidatePath("/admin/questions");
  toastRedirect("/admin/questions", "ok", "Question deleted");
}

export async function toggleQuestionActive(formData: FormData) {
  await requireAdmin();
  const store = await adminDb();
  await store.update("questions", str(formData, "id"), { is_active: str(formData, "value") === "1" });
  toastRedirect(str(formData, "return") || "/admin/questions", "ok", "Updated");
}

export interface ImportState extends ActionState {
  preview?: ImportPreview;
  csvKey?: string;
  imported?: number;
}

/** Step 1: parse + validate (dry run). CSV was uploaded via /api/admin/upload → key. */
export async function previewQuestionImport(prev: ImportState | null, formData: FormData): Promise<ImportState> {
  await requireAdmin();
  const key = str(formData, "csv_key");
  if (!key) return fail({ csv_key: "Upload a CSV file first" });
  const file = await getObject(key);
  if (!file) return { ok: false, error: "Uploaded file could not be read. Upload again." };
  const store = await adminDb();
  const [subjects, exams] = await Promise.all([store.select("subjects"), store.select("exams")]);
  const preview = validateRows(parseCsv(file.data.toString("utf8")), subjects, exams, {
    subject_id: opt(formData, "default_subject_id"), exam_id: opt(formData, "default_exam_id"), year: optNum(formData, "default_year"),
  });
  if (preview.missingColumns.length) return { ok: false, error: `Missing required columns: ${preview.missingColumns.join(", ")}`, preview, csvKey: key };
  return { ok: true, preview, csvKey: key, message: `${preview.validCount} valid row(s), ${preview.errorCount} with errors` };
}

/** Step 2: commit valid rows. Re-parses from storage so nothing large travels via the form. */
export async function commitQuestionImport(prev: ImportState | null, formData: FormData): Promise<ImportState> {
  await requireAdmin();
  const key = str(formData, "csv_key");
  const file = key ? await getObject(key) : null;
  if (!file) return { ok: false, error: "Import session expired. Upload the CSV again." };
  const store = await adminDb();
  const [subjects, exams] = await Promise.all([store.select("subjects"), store.select("exams")]);
  const preview = validateRows(parseCsv(file.data.toString("utf8")), subjects, exams, {
    subject_id: opt(formData, "default_subject_id"), exam_id: opt(formData, "default_exam_id"), year: optNum(formData, "default_year"),
  });
  const rows = preview.rows.filter((r) => r.question).map((r) => r.question!);
  const inserted = await commitImport(rows);
  await deleteObject(key).catch(() => undefined);
  revalidatePath("/admin/questions");
  toastRedirect("/admin/questions", "ok", `Imported ${inserted.length} question(s)${preview.errorCount ? `; ${preview.errorCount} row(s) skipped due to errors` : ""}`);
}
