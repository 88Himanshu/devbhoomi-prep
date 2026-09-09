import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { getSubjectMap } from "@/lib/services/catalog";
import { finalizeAttempt, getAttemptAnswers, getAttemptForUser, getAttemptQuestions, isExpired, remainingSeconds, TestError } from "@/lib/services/tests";
import { TestEngine } from "@/components/tests/engine";
import type { TestAttempt } from "@/lib/types";

export const metadata: Metadata = { title: "Test in progress", robots: { index: false, follow: false } };

export default async function AttemptPage(props: PageProps<"/tests/attempt/[id]">) {
  const { id } = await props.params;
  const user = await requireUser(`/tests/attempt/${id}`);
  let attempt: TestAttempt;
  try {
    attempt = await getAttemptForUser(id, user.id);
  } catch (err) {
    if (err instanceof TestError && err.status === 404) notFound();
    redirect("/tests/history?error=forbidden");
  }
  if (attempt.status === "submitted") redirect(`/tests/result/${attempt.id}`);
  if (isExpired(attempt)) {
    await finalizeAttempt(attempt);
    redirect(`/tests/result/${attempt.id}?timeout=1`);
  }
  const [questions, answers, subjectMap] = await Promise.all([getAttemptQuestions(attempt), getAttemptAnswers(attempt.id), getSubjectMap()]);
  const subjects: Record<string, string> = {};
  for (const [k, v] of subjectMap) subjects[k] = v.name;

  return (
    <TestEngine
      attemptId={attempt.id}
      title={attempt.title}
      studentName={user.full_name}
      durationMinutes={attempt.duration_minutes}
      remainingSeconds={remainingSeconds(attempt)}
      questions={questions}
      subjects={subjects}
      initialAnswers={answers.map((a) => ({ question_id: a.question_id, selected_option: a.selected_option, marked_for_review: a.marked_for_review }))}
    />
  );
}
