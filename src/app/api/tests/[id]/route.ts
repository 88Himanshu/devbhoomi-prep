import { apiUser } from "@/lib/auth/session";
import { getAttemptAnswers, getAttemptForUser, isExpired, finalizeAttempt, remainingSeconds } from "@/lib/services/tests";
import { handleTestError } from "../_util";

/** GET /api/tests/[id] → attempt state (no answers key) */
export async function GET(_req: Request, ctx: RouteContext<"/api/tests/[id]">) {
  const auth = await apiUser();
  if ("error" in auth) return auth.error;
  try {
    const { id } = await ctx.params;
    let attempt = await getAttemptForUser(id, auth.user.id);
    if (attempt.status === "in_progress" && isExpired(attempt)) attempt = await finalizeAttempt(attempt);
    const answers = await getAttemptAnswers(attempt.id);
    return Response.json({
      id: attempt.id,
      status: attempt.status,
      remaining_seconds: attempt.status === "in_progress" ? remainingSeconds(attempt) : 0,
      total_questions: attempt.total_questions,
      answers: answers.map((a) => ({ question_id: a.question_id, selected_option: a.selected_option, marked_for_review: a.marked_for_review, time_spent_seconds: a.time_spent_seconds })),
      ...(attempt.status === "submitted" ? { score: attempt.score, percentage: attempt.percentage, correct: attempt.correct, incorrect: attempt.incorrect, unattempted: attempt.unattempted } : {}),
    });
  } catch (err) {
    return handleTestError(err);
  }
}
