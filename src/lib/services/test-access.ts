import "server-only";
import { getAccessForUser } from "@/lib/access";
import type { MockTest, SessionUser } from "@/lib/types";

/** Whether a user may start/resume a given mock test (free tests are open to any signed-in user). */
export async function canAttemptMock(user: SessionUser | null, mock: MockTest): Promise<{ ok: boolean; reason: "login" | "premium" | null }> {
  if (!user) return { ok: false, reason: "login" };
  if (!mock.is_premium) return { ok: true, reason: null };
  const access = await getAccessForUser(user);
  return access.canAccess("mock_tests") ? { ok: true, reason: null } : { ok: false, reason: "premium" };
}
