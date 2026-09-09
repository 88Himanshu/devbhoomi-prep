import { timingSafeEqual } from "node:crypto";
import { expireLapsedSubscriptions } from "@/lib/services/subscriptions";

/**
 * GET /api/cron/expire-subscriptions — marks lapsed subscriptions as expired.
 * Access is also computed live (see lib/access.ts), so this is housekeeping for reports/admin.
 * Protect with CRON_SECRET (header `x-cron-secret`, or `Authorization: Bearer <secret>` for Vercel Cron).
 *
 * vercel.json:
 *   { "crons": [{ "path": "/api/cron/expire-subscriptions", "schedule": "0 1 * * *" }] }
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const provided = request.headers.get("x-cron-secret") ?? request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (secret) {
    const a = Buffer.from(provided);
    const b = Buffer.from(secret);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  } else if (process.env.NODE_ENV === "production") {
    return Response.json({ error: "CRON_SECRET not configured" }, { status: 503 });
  }
  const expired = await expireLapsedSubscriptions();
  return Response.json({ ok: true, expired, at: new Date().toISOString() });
}
