"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { adminDb } from "@/lib/data";
import { requireAdmin } from "@/lib/auth/session";
import { slugify } from "@/lib/utils";
import { bool, csvList, fail, json, lines, num, str, toastRedirect, zodErrors, type ActionState } from "./helpers";

const syllabusSchema = z.array(z.object({ title: z.string().min(1), topics: z.array(z.string()) }));
const patternSchema = z.array(z.object({ stage: z.string(), subject: z.string(), questions: z.number(), marks: z.number(), duration: z.string(), negative_marking: z.string() }));
const planSchema = z.array(z.object({ week: z.number(), focus: z.string(), tasks: z.array(z.string()) }));

const examSchema = z.object({
  name: z.string().min(3).max(120),
  short_name: z.string().min(2).max(40),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, "lowercase letters, numbers and dashes only"),
  conducting_body: z.string().min(2),
  category: z.string().min(2),
  tagline: z.string().max(160),
  overview: z.string().max(8000),
  icon: z.string().min(1),
  sort_order: z.number().int().min(0),
});

export async function saveExam(prev: ActionState | null, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = str(formData, "id") || null;
  const base = examSchema.safeParse({
    name: str(formData, "name"), short_name: str(formData, "short_name"),
    slug: str(formData, "slug") || slugify(str(formData, "name")),
    conducting_body: str(formData, "conducting_body"), category: str(formData, "category"),
    tagline: str(formData, "tagline"), overview: str(formData, "overview"), icon: str(formData, "icon") || "Landmark",
    sort_order: num(formData, "sort_order"),
  });
  if (!base.success) return fail(zodErrors(base.error));
  const syllabus = json(formData, "syllabus", syllabusSchema);
  const pattern = json(formData, "exam_pattern", patternSchema);
  const plan = json(formData, "study_plan", planSchema);
  const errs: Record<string, string> = {};
  if (!syllabus.ok) errs.syllabus = syllabus.error;
  if (!pattern.ok) errs.exam_pattern = pattern.error;
  if (!plan.ok) errs.study_plan = plan.error;
  if (Object.keys(errs).length) return fail(errs);

  const store = await adminDb();
  const dup = await store.selectOne("exams", { eq: { slug: base.data.slug } });
  if (dup && dup.id !== id) return fail({ slug: "Another exam already uses this slug" });
  const qids = csvList(formData, "important_question_ids");
  if (qids.length) {
    const found = await store.select("questions", { in: { id: qids } });
    const missing = qids.filter((q) => !found.some((f) => f.id === q));
    if (missing.length) return fail({ important_question_ids: `Unknown question ids: ${missing.slice(0, 5).join(", ")}` });
  }
  const payload = {
    ...base.data,
    eligibility: lines(formData, "eligibility"),
    syllabus: syllabus.ok ? syllabus.value : [],
    exam_pattern: pattern.ok ? pattern.value : [],
    study_plan: plan.ok ? plan.value : [],
    important_question_ids: qids,
    is_featured: bool(formData, "is_featured"),
    is_active: bool(formData, "is_active"),
  };
  if (id) {
    await store.update("exams", id, payload);
  } else {
    await store.insert("exams", payload);
  }
  revalidatePath("/admin/exams");
  revalidatePath("/exams");
  revalidatePath(`/exams/${payload.slug}`);
  toastRedirect("/admin/exams", "ok", `${payload.name} ${id ? "updated" : "created"}`);
}

export async function deleteExam(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  const force = bool(formData, "force");
  const store = await adminDb();
  const exam = await store.getById("exams", id);
  if (!exam) toastRedirect("/admin/exams", "err", "Exam not found");
  const [tests, papers] = await Promise.all([store.count("mock_tests", { eq: { exam_id: id } }), store.count("previous_year_papers", { eq: { exam_id: id } })]);
  if ((tests || papers) && !force) toastRedirect("/admin/exams", "err", `${exam.name} has ${tests} mock tests and ${papers} papers. Tick "force" to delete anyway.`);
  await store.delete("exams", id);
  revalidatePath("/admin/exams");
  revalidatePath("/exams");
  toastRedirect("/admin/exams", "ok", `${exam.name} deleted`);
}

export async function toggleExamFlag(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  const field = str(formData, "field") === "is_active" ? "is_active" : "is_featured";
  const value = str(formData, "value") === "1";
  const store = await adminDb();
  await store.update("exams", id, { [field]: value });
  revalidatePath("/admin/exams");
  revalidatePath("/");
  toastRedirect(str(formData, "return") || "/admin/exams", "ok", "Updated");
}

export async function saveFeaturedExams(formData: FormData) {
  await requireAdmin();
  const store = await adminDb();
  const exams = await store.select("exams");
  for (const e of exams) {
    await store.update("exams", e.id, { is_featured: bool(formData, `featured_${e.id}`), sort_order: num(formData, `sort_${e.id}`, e.sort_order) });
  }
  revalidatePath("/");
  toastRedirect("/admin/homepage", "ok", "Featured exams saved");
}

