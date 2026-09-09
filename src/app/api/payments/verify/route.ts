import { z } from "zod";
import { apiUser } from "@/lib/auth/session";
import { isRazorpayConfigured } from "@/lib/env";
import { adminDb } from "@/lib/data";
import { verifyPaymentSignature } from "@/lib/payments/razorpay";
import { failPayment, settlePayment } from "@/lib/services/payments";

const liveSchema = z.object({
  payment_id: z.string().min(1),
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});
const sandboxSchema = z.object({ payment_id: z.string().min(1), sandbox: z.literal(true), method: z.string().max(20).optional() });
const failSchema = z.object({ payment_id: z.string().min(1), failed: z.literal(true), reason: z.string().max(200).optional() });

/**
 * POST /api/payments/verify
 *  live:    { payment_id, razorpay_order_id, razorpay_payment_id, razorpay_signature }
 *  sandbox: { payment_id, sandbox: true }        (only when Razorpay keys are absent, never in production)
 *  failed:  { payment_id, failed: true, reason } (client reports a dismissed/failed checkout)
 * Signature is verified on the server; the client's word is never trusted.
 */
export async function POST(request: Request) {
  const auth = await apiUser();
  if ("error" in auth) return auth.error;
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return Response.json({ error: "Invalid body" }, { status: 400 });

  const store = await adminDb();
  const paymentId = typeof (body as { payment_id?: unknown }).payment_id === "string" ? (body as { payment_id: string }).payment_id : "";
  const payment = paymentId ? await store.getById("payments", paymentId) : null;
  if (!payment || payment.user_id !== auth.user.id) return Response.json({ error: "Payment not found" }, { status: 404 });

  const failed = failSchema.safeParse(body);
  if (failed.success) {
    await failPayment(payment, failed.data.reason ?? "Payment was not completed");
    return Response.json({ ok: false, status: "failed" });
  }

  const sandbox = sandboxSchema.safeParse(body);
  if (sandbox.success) {
    if (isRazorpayConfigured() || process.env.NODE_ENV === "production") {
      return Response.json({ error: "Sandbox payments are disabled" }, { status: 400 });
    }
    if (!payment.razorpay_order_id?.startsWith("order_sandbox_")) {
      return Response.json({ error: "Not a sandbox order" }, { status: 400 });
    }
    const result = await settlePayment(payment, { razorpayPaymentId: `pay_sandbox_${payment.id.slice(0, 8)}`, method: sandbox.data.method ?? "sandbox" });
    return Response.json({ ok: true, status: "paid", subscription: result.subscription, invoice_number: result.payment.invoice_number });
  }

  const live = liveSchema.safeParse(body);
  if (!live.success) return Response.json({ error: "Invalid payload" }, { status: 400 });
  if (!isRazorpayConfigured()) return Response.json({ error: "Payments are not configured" }, { status: 503 });
  if (payment.razorpay_order_id !== live.data.razorpay_order_id) {
    return Response.json({ error: "Order mismatch" }, { status: 400 });
  }
  if (!verifyPaymentSignature(live.data.razorpay_order_id, live.data.razorpay_payment_id, live.data.razorpay_signature)) {
    await failPayment(payment, "Signature verification failed", live.data.razorpay_payment_id);
    return Response.json({ error: "Payment verification failed" }, { status: 400 });
  }
  const result = await settlePayment(payment, { razorpayPaymentId: live.data.razorpay_payment_id, signature: live.data.razorpay_signature });
  return Response.json({ ok: true, status: "paid", subscription: result.subscription, invoice_number: result.payment.invoice_number });
}
