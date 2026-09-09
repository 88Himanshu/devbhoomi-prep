import { adminDb } from "@/lib/data";
import { env } from "@/lib/env";
import { verifyWebhookSignature } from "@/lib/payments/razorpay";
import { failPayment, refundPayment, settlePayment } from "@/lib/services/payments";

/**
 * Razorpay webhook (configure in Dashboard → Webhooks with RAZORPAY_WEBHOOK_SECRET).
 * Events: payment.captured, payment.failed, refund.processed.
 * The raw body is verified against X-Razorpay-Signature before anything is trusted.
 * Excluded from proxy.ts matcher so no session cookie logic runs here.
 */
interface WebhookPayload {
  event: string;
  payload?: {
    payment?: { entity?: { id: string; order_id?: string; method?: string; error_description?: string; status?: string } };
    refund?: { entity?: { id: string; payment_id: string; status?: string } };
  };
}

export async function POST(request: Request) {
  const raw = await request.text();
  const signature = request.headers.get("x-razorpay-signature");
  if (!env.RAZORPAY_WEBHOOK_SECRET) return Response.json({ error: "Webhook secret not configured" }, { status: 400 });
  if (!verifyWebhookSignature(raw, signature)) return Response.json({ error: "Invalid signature" }, { status: 400 });

  let event: WebhookPayload;
  try {
    event = JSON.parse(raw) as WebhookPayload;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const store = await adminDb();
  const paymentEntity = event.payload?.payment?.entity;

  switch (event.event) {
    case "payment.captured":
    case "order.paid": {
      if (!paymentEntity?.order_id) break;
      const payment = await store.selectOne("payments", { eq: { razorpay_order_id: paymentEntity.order_id } });
      if (!payment) break;
      await settlePayment(payment, { razorpayPaymentId: paymentEntity.id, method: paymentEntity.method ?? null });
      break;
    }
    case "payment.failed": {
      if (!paymentEntity?.order_id) break;
      const payment = await store.selectOne("payments", { eq: { razorpay_order_id: paymentEntity.order_id } });
      if (!payment) break;
      await failPayment(payment, paymentEntity.error_description ?? "Payment failed", paymentEntity.id);
      break;
    }
    case "refund.processed": {
      const refund = event.payload?.refund?.entity;
      if (!refund?.payment_id) break;
      const payment = await store.selectOne("payments", { eq: { razorpay_payment_id: refund.payment_id } });
      if (!payment) break;
      await refundPayment(payment, refund.status ?? "refunded");
      break;
    }
    default:
      break;
  }
  return Response.json({ received: true });
}
