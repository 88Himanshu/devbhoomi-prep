import { apiUser } from "@/lib/auth/session";
import { customPoolCounts } from "@/lib/services/tests";

/** GET /api/tests/pool?exam=exam_ukpsc → { [subject_id|'all']: { easy, medium, hard, mixed } } */
export async function GET(request: Request) {
  const auth = await apiUser();
  if ("error" in auth) return auth.error;
  const examId = new URL(request.url).searchParams.get("exam");
  if (!examId) return Response.json({ error: "exam is required" }, { status: 400 });
  return Response.json(await customPoolCounts(examId));
}
