import { z } from "zod";
import { apiUser } from "@/lib/auth/session";
import { db } from "@/lib/data";
import { canAttemptMock } from "@/lib/services/test-access";
import { createAttemptFromMock } from "@/lib/services/tests";
import { handleTestError } from "../_util";

const schema = z.object({ mock_test_id: z.string().min(1) });

/** POST /api/tests/start { mock_test_id } → { attempt_id } */
export async function POST(request: Request) {
  const auth = await apiUser();
  if ("error" in auth) return auth.error;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "mock_test_id is required" }, { status: 400 });
  try {
    const mock = await (await db()).getById("mock_tests", parsed.data.mock_test_id);
    if (!mock || !mock.is_published) return Response.json({ error: "Test not found" }, { status: 404 });
    const gate = await canAttemptMock(auth.user, mock);
    if (!gate.ok) return Response.json({ error: "Premium subscription required", code: "PREMIUM_REQUIRED" }, { status: 402 });
    const before = Date.now();
    const attempt = await createAttemptFromMock(auth.user.id, mock);
    return Response.json({ attempt_id: attempt.id, resumed: new Date(attempt.started_at).getTime() < before });
  } catch (err) {
    return handleTestError(err);
  }
}
