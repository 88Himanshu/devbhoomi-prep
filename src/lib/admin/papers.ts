"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { adminDb } from "@/lib/data";
import { requireAdmin } from "@/lib/auth/session";
import { deleteObject, getObject } from "@/lib/storage";
import { slugify } from "@/lib/utils";
import { commitImport, parseCsv, validateRows } from "@/lib/services/questions-import";
import { recomputeMockTest } from "./mock-tests";
import { bool, fail, num, opt, optNum, str, toastRedirect, zodErrors, type ActionState } from "./helpers";

const schema = z.object({
  exam_id: z.string().min(1, "Pick an exam"),
  subject_id: z.string().nullable(),
  year: z.number().int().min(1990).max(2100),
  paper_type: z.enum(["prelims", "mains", "screening", "written", "other"]),
  title: z.string().min(3).max(160),
  total_questions: z.number().int().min(0).max(500),
  duration_minutes: z.number().int().min(0).max(600).nullable(),
  language: z.enum(["en", "hi", "bilingual"]),
});

export async function savePaper(prev: ActionState | null, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = str(formData, "id") || null;
  const parsed = schema.safeParse({
    exam_id: str(formData, "exam_id"), subject_id: opt(formData, "subject_id"), year: num(formData, "year"),
    paper_type: str(formData, "paper_type") || "prelims", title: str(formData, "title"), total_questions: num(formData, "total_questions"),
    duration_minutes: optNum(formData, "duration_minutes"), language: str(formData, "language") || "bilingual",
  });
  if (!parsed.success) return fail(zodErrors(parsed.error));
  const store = await adminDb();
  const payload = {
    ...parsed.data,
    file_path: opt(formData, "file_path"),
    is_premium: bool(formData, "is_premium"),
    is_published: bool(formData, "is_published"),
  };
  let paperId = id;
  if (id) {
    const existing = await store.getById("previous_year_papers", id);
    if (!existing) return { ok: false, error: "Not found" };
    if (existing.file_path && existing.file_path !== payload.file_path) await deleteObject(existing.file_path).catch(() => undefined);
    await store.update("previous_year_papers", id, payload);
  } else {
    const row = await store.insert("previous_year_papers", { ...payload, mock_test_id: null, downloads: 0 });
    paperId = row.id;
  }
  // Optional: CSV of questions → create/attach a mock test in the same step.
  const csvKey = opt(formData, "questions_csv");
  if (csvKey && paperId) {
    const res = await attachCsvToPaper(paperId, csvKey);
    if (!res.ok) return res;
  } else if (bool(formData, "convert_to_mock") && paperId) {
    await convertPaper(paperId);
  }
  revalidatePath("/admin/papers");
  revalidatePath("/previous-year-papers");
  toastRedirect("/admin/papers", "ok", `${payload.title} ${id ? "updated" : "created"}`);
}

async function convertPaper(paperId: string): Promise<string> {
  const store = await adminDb();
  const paper = await store.getById("previous_year_papers", paperId);
  if (!paper) throw new Error("Paper not found");
  if (paper.mock_test_id) return paper.mock_test_id;
  const baseSlug = slugify(`${paper.title}-pyp`);
  let slug = baseSlug;
  for (let i = 2; await store.selectOne("mock_tests", { eq: { slug } }); i++) slug = `${baseSlug}-${i}`;
  const mock = await store.insert("mock_tests", {
    slug,
    title: `${paper.title} – Previous Year Paper`,
    description: `Timed mock test built from the ${paper.year} ${paper.paper_type} paper. Add questions from the question bank or import a CSV.`,
    exam_id: paper.exam_id,
    subject_id: paper.subject_id,
    difficulty: "medium",
    duration_minutes: paper.duration_minutes ?? Math.max(30, Math.round(paper.total_questions * 1.2 / 5) * 5),
    total_marks: 0,
    negative_marks: 0.25,
    question_count: 0,
    is_premium: paper.is_premium,
    is_published: false,
    is_pyp: true,
    attempts_count: 0,
  });
  await store.update("previous_year_papers", paperId, { mock_test_id: mock.id });
  return mock.id;
}

async function attachCsvToPaper(paperId: string, csvKey: string): Promise<ActionState> {
  const store = await adminDb();
  const paper = await store.getById("previous_year_papers", paperId);
  if (!paper) return { ok: false, error: "Paper not found" };
  const file = await getObject(csvKey);
  if (!file) return fail({ questions_csv: "Uploaded CSV could not be read" });
  const [subjects, exams] = await Promise.all([store.select("subjects"), store.select("exams")]);
  const preview = validateRows(parseCsv(file.data.toString("utf8")), subjects, exams, { subject_id: paper.subject_id, exam_id: paper.exam_id, year: paper.year });
  if (preview.missingColumns.length) return fail({ questions_csv: `CSV is missing columns: ${preview.missingColumns.join(", ")}` });
  if (preview.errorCount) return fail({ questions_csv: `${preview.errorCount} row(s) have errors (first: line ${preview.rows.find((r) => r.errors.length)?.line}: ${preview.rows.find((r) => r.errors.length)?.errors[0]}). Fix the CSV or use Questions → Bulk import to preview.` });
  const mockId = await convertPaper(paperId);
  const inserted = await commitImport(preview.rows.map((r) => r.question!));
  const existing = await store.count("mock_test_questions", { eq: { mock_test_id: mockId } });
  await store.insertMany("mock_test_questions", inserted.map((q, i) => ({ mock_test_id: mockId, question_id: q.id, sort_order: existing + i + 1 })));
  await recomputeMockTest(mockId);
  await deleteObject(csvKey).catch(() => undefined);
  return { ok: true };
}

export async function convertPaperToMock(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  const store = await adminDb();
  const paper = await store.getById("previous_year_papers", id);
  if (!paper) toastRedirect("/admin/papers", "err", "Paper not found");
  const mockId = await convertPaper(id);
  revalidatePath("/admin/papers");
  revalidatePath("/admin/mock-tests");
  toastRedirect(`/admin/mock-tests/${mockId}/questions`, "ok", `Mock test created from "${paper.title}". Add its questions below, then publish.`);
}

export async function deletePaper(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  const store = await adminDb();
  const row = await store.getById("previous_year_papers", id);
  if (!row) toastRedirect("/admin/papers", "err", "Not found");
  if (row.file_path) await deleteObject(row.file_path).catch(() => undefined);
  await store.delete("previous_year_papers", id);
  revalidatePath("/admin/papers");
  revalidatePath("/previous-year-papers");
  toastRedirect("/admin/papers", "ok", `${row.title} deleted`);
}
