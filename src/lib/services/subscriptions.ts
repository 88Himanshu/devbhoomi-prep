import "server-only";
import { adminDb } from "@/lib/data";
import { getPlan } from "@/lib/plans";
import type { PlanId, Subscription, SubscriptionSource } from "@/lib/types";

/**
 * Activate (or extend) a premium subscription. Used by the verified Razorpay
 * flow and by admin manual activation. Always runs with adminDb (trusted server code).
 * If the user already has an active subscription, the new period starts when it ends.
 */
export async function activateSubscription(opts: {
  userId: string;
  planId: PlanId;
  source: SubscriptionSource;
  paymentId?: string | null;
  note?: string | null;
}): Promise<Subscription> {
  const store = await adminDb();
  const plan = getPlan(opts.planId);
  const now = new Date();
  const active = await store.select("subscriptions", {
    eq: { user_id: opts.userId, status: "active" },
    order: [{ column: "ends_at", ascending: false }],
    limit: 1,
  });
  const base = active[0] && new Date(active[0].ends_at) > now ? new Date(active[0].ends_at) : now;
  const ends = new Date(base.getTime() + plan.duration_days * 86_400_000);
  return store.insert("subscriptions", {
    user_id: opts.userId,
    plan_id: opts.planId,
    status: "active",
    source: opts.source,
    starts_at: base.toISOString(),
    ends_at: ends.toISOString(),
    payment_id: opts.paymentId ?? null,
    note: opts.note ?? null,
  });
}

export async function deactivateSubscription(subscriptionId: string, note?: string) {
  const store = await adminDb();
  return store.update("subscriptions", subscriptionId, {
    status: "cancelled",
    ends_at: new Date().toISOString(),
    ...(note ? { note } : {}),
  });
}

/** Mark every active subscription whose period has passed as expired (safe to call often). */
export async function expireLapsedSubscriptions(): Promise<number> {
  const store = await adminDb();
  const rows = await store.select("subscriptions", { eq: { status: "active" }, lte: { ends_at: new Date().toISOString() } });
  for (const s of rows) await store.update("subscriptions", s.id, { status: "expired" });
  return rows.length;
}

export function nextInvoiceNumber(seq: number, date = new Date()) {
  return `INV-${date.getFullYear()}-${String(seq).padStart(4, "0")}`;
}
