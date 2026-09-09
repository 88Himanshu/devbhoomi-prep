import { z } from "zod";
import { apiUser } from "@/lib/auth/session";
import { getAttemptForUser, saveAnswer, remainingSeconds } from "@/lib/services/tests";
import { handleTestError } from "../../_util";

const schema = z.object({
  question_id: z.string().min(1),
  selected_option: z.enum(["A", "B", "C", "D"]).nullable().optional(),
  marked_for_review: z.boolean().optional(),
  time_spent_seconds: z.number().int().min(0).max(3600).optional(),
});

/** POST /api/tests/[id]/answer → save one answer (autosave). 409 when submitted; returns finalized=true when time elapsed. */
export async function POST(request: Request, ctx: RouteContext<"/api/tests/[id]/answer">) {
  const auth = await apiUser();
  if ("error" in auth) return auth.error;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid answer payload", issues: parsed.error.issues }, { status: 400 });
  try {
    const { id } = await ctx.params;
    const attempt = await getAttemptForUser(id, auth.user.id);
    const { question_id, ...input } = parsed.data;
    const result = await saveAnswer(attempt, question_id, input);
    if (result.finalized) return Response.json({ finalized: true, remaining_seconds: 0 });
    return Response.json({ ok: true, remaining_seconds: remainingSeconds(attempt) });
  } catch (err) {
    return handleTestError(err);
  }
}
