"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth/session";
import { getAccess } from "@/lib/access";
import { db } from "@/lib/data";
import { getExamMap, getSubjectMap } from "@/lib/services/catalog";
import { canAttemptMock } from "@/lib/services/test-access";
import { createAttemptFromMock, createCustomAttempt, TestError } from "@/lib/services/tests";

/** Start (or resume) a mock test attempt and go to the engine. */
export async function startMockTest(formData: FormData) {
  const mockId = String(formData.get("mock_test_id") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const user = await requireUser(`/mock-tests/${slug}`);
  const mock = await (await db()).getById("mock_tests", mockId);
  if (!mock || !mock.is_published) redirect("/mock-tests?error=not-found");
  const gate = await canAttemptMock(user, mock);
  if (!gate.ok) redirect(`/mock-tests/${mock.slug}?locked=1`);
  const attempt = await createAttemptFromMock(user.id, mock);
  redirect(`/tests/attempt/${attempt.id}`);
}

export interface CustomTestState { error?: string }

const customSchema = z.object({
  exam_id: z.string().min(1, "Choose an exam"),
  subject_id: z.string().optional().transform((v) => (v ? v : null)),
  difficulty: z.enum(["easy", "medium", "hard", "mixed"]),
  question_count: z.coerce.number().int().min(5).max(100),
});

export async function startCustomTest(_prev: CustomTestState | null, formData: FormData): Promise<CustomTestState> {
  const user = await requireUser("/tests/new");
  const access = await getAccess();
  if (!access.canAccess("mock_tests")) return { error: "Custom tests are a premium feature. Upgrade to continue." };
  const parsed = customSchema.safeParse({
    exam_id: formData.get("exam_id"),
    subject_id: formData.get("subject_id") || undefined,
    difficulty: formData.get("difficulty"),
    question_count: formData.get("question_count"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid selection" };
  const [exams, subjects] = await Promise.all([getExamMap(), getSubjectMap()]);
  const exam = exams.get(parsed.data.exam_id);
  if (!exam) return { error: "Unknown exam" };
  const subject = parsed.data.subject_id ? subjects.get(parsed.data.subject_id) : null;
  let attemptId: string;
  try {
    const attempt = await createCustomAttempt(user.id, parsed.data, exam.short_name, subject?.name ?? null);
    attemptId = attempt.id;
  } catch (err) {
    return { error: err instanceof TestError ? err.message : "Could not create the test" };
  }
  redirect(`/tests/attempt/${attemptId}`);
}

/** Retake: always creates a fresh attempt for a mock (finalising any expired in-progress one). */
export async function retakeMockTest(formData: FormData) {
  return startMockTest(formData);
}
