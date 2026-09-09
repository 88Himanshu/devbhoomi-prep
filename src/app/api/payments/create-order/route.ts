import { z } from "zod";
import { apiUser } from "@/lib/auth/session";
import { env, isRazorpayConfigured } from "@/lib/env";
import { getPlan, isPlanId } from "@/lib/plans";
import { createOrder } from "@/lib/payments/razorpay";
import { createPaymentRecord, newReceipt, sandboxOrderId } from "@/lib/services/payments";
import { adminDb } from "@/lib/data";

const bodySchema = z.object({ plan_id: z.string() });

/**
 * POST /api/payments/create-order  { plan_id }
 * → { payment_id, order_id, amount, currency, key_id, sandbox, plan }
 */
export async function POST(request: Request) {
  const auth = await apiUser();
  if ("error" in auth) return auth.error;
  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success || !isPlanId(parsed.data.plan_id)) {
    return Response.json({ error: "Invalid plan" }, { status: 400 });
  }
  const userRow = await (await adminDb()).getById("users", auth.user.id);
  if (!userRow || userRow.is_blocked) return Response.json({ error: "Account unavailable" }, { status: 403 });

  const plan = getPlan(parsed.data.plan_id);
  const receipt = newReceipt();
  const sandbox = !isRazorpayConfigured();
  let orderId: string;
  if (sandbox) {
    if (process.env.NODE_ENV === "production") {
      return Response.json({ error: "Payments are not configured" }, { status: 503 });
    }
    orderId = sandboxOrderId();
  } else {
    try {
      const order = await createOrder(plan.price * 100, receipt, { user_id: auth.user.id, plan_id: plan.id });
      orderId = order.id;
    } catch (err) {
      console.error("[payments] create order failed", err);
      return Response.json({ error: "Could not start payment. Please try again." }, { status: 502 });
    }
  }
  const payment = await createPaymentRecord({ userId: auth.user.id, planId: plan.id, razorpayOrderId: orderId, receipt });
  return Response.json({
    payment_id: payment.id,
    order_id: orderId,
    amount: payment.amount,
    currency: "INR",
    key_id: sandbox ? null : env.RAZORPAY_KEY_ID,
    sandbox,
    plan: { id: plan.id, name: plan.name, price: plan.price },
    prefill: { name: auth.user.full_name, email: auth.user.email, contact: userRow.mobile ?? "" },
  });
}
