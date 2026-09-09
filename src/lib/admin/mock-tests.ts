"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { adminDb } from "@/lib/data";
import { requireAdmin } from "@/lib/auth/session";
import { slugify } from "@/lib/utils";
import { saveQuestionRow } from "./questions";
import { bool, fail, list, num, opt, str, toastRedirect, zodErrors, type ActionState } from "./helpers";

const schema = z.object({
  title: z.string().min(3).max(160),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, "lowercase letters, numbers and dashes only"),
  description: z.string().max(2000),
  exam_id: z.string().min(1, "Pick an exam"),
  subject_id: z.string().nullable(),
  difficulty: z.enum(["easy", "medium", "hard"]),
  duration_minutes: z.number().int().min(5).max(600),
  negative_marks: z.number().min(0).max(5),
});

/** Keep question_count / total_marks in sync with mock_test_questions. */
export async function recomputeMockTest(mockTestId: string) {
  const store = await adminDb();
  const links = await store.select("mock_test_questions", { eq: { mock_test_id: mockTestId }, order: [{ column: "sort_order" }] });
  const qs = links.length ? await store.select("questions", { in: { id: links.map((l) => l.question_id) } }) : [];
  const total = qs.reduce((s, q) => s + Number(q.marks), 0);
  await store.update("mock_tests", mockTestId, { question_count: links.length, total_marks: total });
}

export async function saveMockTest(prev: ActionState | null, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = str(formData, "id") || null;
  const parsed = schema.safeParse({
    title: str(formData, "title"), slug: str(formData, "slug") || slugify(str(formData, "title")), description: str(formData, "description"),
    exam_id: str(formData, "exam_id"), subject_id: opt(formData, "subject_id"), difficulty: str(formData, "difficulty") || "medium",
    duration_minutes: num(formData, "duration_minutes", 60), negative_marks: num(formData, "negative_marks", 0.25),
  });
  if (!parsed.success) return fail(zodErrors(parsed.error));
  const store = await adminDb();
  const dup = await store.selectOne("mock_tests", { eq: { slug: parsed.data.slug } });
  if (dup && dup.id !== id) return fail({ slug: "Slug already in use" });
  const payload = { ...parsed.data, is_premium: bool(formData, "is_premium"), is_published: bool(formData, "is_published"), is_pyp: bool(formData, "is_pyp") };
  let target = id;
  if (id) {
    await store.update("mock_tests", id, payload);
  } else {
    const row = await store.insert("mock_tests", { ...payload, total_marks: 0, question_count: 0, attempts_count: 0 });
    target = row.id;
  }
  revalidatePath("/admin/mock-tests");
  revalidatePath("/mock-tests");
  toastRedirect(id ? "/admin/mock-tests" : `/admin/mock-tests/${target}/questions`, "ok", id ? `${payload.title} updated` : `${payload.title} created — now add questions`);
}

export async function deleteMockTest(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  const store = await adminDb();
  const mock = await store.getById("mock_tests", id);
  if (!mock) toastRedirect("/admin/mock-tests", "err", "Not found");
  const attempts = await store.count("test_attempts", { eq: { mock_test_id: id } });
  if (attempts && !bool(formData, "force")) toastRedirect("/admin/mock-tests", "err", `${mock.title} has ${attempts} student attempts. Unpublish it instead, or tick "force" to delete.`);
  await store.deleteWhere("mock_test_questions", { eq: { mock_test_id: id } });
  await store.deleteWhere("bookmarks", { eq: { item_type: "mock_test", item_id: id } });
  const papers = await store.select("previous_year_papers", { eq: { mock_test_id: id } });
  for (const p of papers) await store.update("previous_year_papers", p.id, { mock_test_id: null });
  await store.delete("mock_tests", id);
  revalidatePath("/admin/mock-tests");
  revalidatePath("/mock-tests");
  toastRedirect("/admin/mock-tests", "ok", `${mock.title} deleted`);
}

export async function toggleMockFlag(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  const field = (["is_premium", "is_published"] as const).find((f) => f === str(formData, "field")) ?? "is_published";
  const store = await adminDb();
  const mock = await store.getById("mock_tests", id);
  if (!mock) toastRedirect("/admin/mock-tests", "err", "Not found");
  if (field === "is_published" && str(formData, "value") === "1" && mock.question_count === 0) toastRedirect("/admin/mock-tests", "err", "Add questions before publishing");
  await store.update("mock_tests", id, { [field]: str(formData, "value") === "1" });
  revalidatePath("/admin/mock-tests");
  revalidatePath("/mock-tests");
  toastRedirect(str(formData, "return") || "/admin/mock-tests", "ok", "Updated");
}

const qpath = (id: string) => `/admin/mock-tests/${id}/questions`;

export async function addQuestionsToMock(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "mock_test_id");
  const ids = list(formData, "question_ids");
  if (!ids.length) toastRedirect(qpath(id), "err", "Select at least one question");
  const store = await adminDb();
  const existing = await store.select("mock_test_questions", { eq: { mock_test_id: id } });
  const have = new Set(existing.map((e) => e.question_id));
  const fresh = ids.filter((q) => !have.has(q));
  let order = existing.reduce((m, e) => Math.max(m, e.sort_order), 0);
  await store.insertMany("mock_test_questions", fresh.map((q) => ({ mock_test_id: id, question_id: q, sort_order: ++order })));
  await recomputeMockTest(id);
  toastRedirect(qpath(id), "ok", `${fresh.length} question(s) added${ids.length - fresh.length ? `, ${ids.length - fresh.length} already present` : ""}`);
}

export async function removeQuestionFromMock(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "mock_test_id");
  const store = await adminDb();
  await store.deleteWhere("mock_test_questions", { eq: { mock_test_id: id, question_id: str(formData, "question_id") } });
  await renumber(id);
  await recomputeMockTest(id);
  toastRedirect(qpath(id), "ok", "Question removed");
}

export async function moveQuestionInMock(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "mock_test_id");
  const qid = str(formData, "question_id");
  const dir = str(formData, "dir") === "up" ? -1 : 1;
  const store = await adminDb();
  const links = await store.select("mock_test_questions", { eq: { mock_test_id: id }, order: [{ column: "sort_order" }] });
  const i = links.findIndex((l) => l.question_id === qid);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= links.length) toastRedirect(qpath(id), "err", "Cannot move further");
  await store.update("mock_test_questions", links[i].id, { sort_order: links[j].sort_order });
  await store.update("mock_test_questions", links[j].id, { sort_order: links[i].sort_order });
  toastRedirect(qpath(id), "ok", "Reordered");
}

async function renumber(mockId: string) {
  const store = await adminDb();
  const links = await store.select("mock_test_questions", { eq: { mock_test_id: mockId }, order: [{ column: "sort_order" }] });
  for (let i = 0; i < links.length; i++) if (links[i].sort_order !== i + 1) await store.update("mock_test_questions", links[i].id, { sort_order: i + 1 });
}

/** Inline "add new question" from the mock test editor: creates the question and links it. */
export async function createQuestionInMock(prev: ActionState | null, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = str(formData, "mock_test_id");
  const res = await saveQuestionRow(formData);
  if (!res.ok || !res.question) return res;
  const store = await adminDb();
  const existing = await store.select("mock_test_questions", { eq: { mock_test_id: id } });
  const order = existing.reduce((m, e) => Math.max(m, e.sort_order), 0) + 1;
  await store.insert("mock_test_questions", { mock_test_id: id, question_id: res.question.id, sort_order: order });
  await recomputeMockTest(id);
  toastRedirect(qpath(id), "ok", "Question created and added to the test");
}
