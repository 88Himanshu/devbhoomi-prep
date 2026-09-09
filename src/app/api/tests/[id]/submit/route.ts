import { apiUser } from "@/lib/auth/session";
import { submitAttempt } from "@/lib/services/tests";
import { handleTestError } from "../../_util";

/** POST /api/tests/[id]/submit → grades the attempt. 409 when already submitted. */
export async function POST(_req: Request, ctx: RouteContext<"/api/tests/[id]/submit">) {
  const auth = await apiUser();
  if ("error" in auth) return auth.error;
  try {
    const { id } = await ctx.params;
    const a = await submitAttempt(id, auth.user.id);
    return Response.json({
      id: a.id, status: a.status, score: a.score, total_marks: a.total_marks, percentage: a.percentage, accuracy: a.accuracy,
      correct: a.correct, incorrect: a.incorrect, unattempted: a.unattempted, attempted: a.attempted, time_taken_seconds: a.time_taken_seconds, percentile: a.percentile,
    });
  } catch (err) {
    return handleTestError(err);
  }
}
