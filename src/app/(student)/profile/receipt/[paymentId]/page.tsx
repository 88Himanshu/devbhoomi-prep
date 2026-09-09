import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { db, adminDb } from "@/lib/data";
import { getPlan, formatINR } from "@/lib/plans";
import { formatDate, formatDateTime } from "@/lib/utils";
import { LogoMark } from "@/components/layout/logo";
import { ButtonLink } from "@/components/ui/button";
import { PrintButton } from "@/components/payments/print-button";

export const metadata: Metadata = { title: "Receipt", robots: { index: false } };

export default async function ReceiptPage(props: PageProps<"/profile/receipt/[paymentId]">) {
  const [user, { paymentId }] = await Promise.all([requireUser(), props.params]);
  const store = await db();
  const payment = await store.getById("payments", paymentId);
  if (!payment || payment.user_id !== user.id || (payment.status !== "paid" && payment.status !== "refunded")) notFound();
  const [userRow, subscription, site] = await Promise.all([
    store.getById("users", user.id),
    store.selectOne("subscriptions", { eq: { payment_id: payment.id } }),
    (await adminDb()).getById("settings", "site"),
  ]);
  const plan = getPlan(payment.plan_id);
  const siteInfo = (site?.value ?? {}) as Record<string, string>;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-center justify-between print:hidden">
        <ButtonLink href="/profile" variant="ghost" size="sm">← Back to profile</ButtonLink>
        <PrintButton />
      </div>
      <article className="rounded-card border border-ink-200 bg-white p-8 shadow-card print:border-0 print:shadow-none">
        <header className="flex items-start justify-between gap-4 border-b border-ink-100 pb-6">
          <div className="flex items-center gap-3">
            <LogoMark />
            <div>
              <p className="text-lg font-bold text-brand-900">Devbhoomi Prep</p>
              <p className="text-xs text-ink-500">{siteInfo.address ?? "Dehradun, Uttarakhand"}</p>
              <p className="text-xs text-ink-500">{siteInfo.support_email ?? "support@devbhoomiprep.in"}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">{payment.status === "refunded" ? "Refund receipt" : "Payment receipt"}</p>
            <p className="mt-1 font-mono text-sm font-semibold text-ink-900">{payment.invoice_number ?? payment.receipt}</p>
            <p className="text-xs text-ink-500">{formatDateTime(payment.paid_at ?? payment.created_at)}</p>
          </div>
        </header>

        <section className="grid gap-6 py-6 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">Billed to</p>
            <p className="mt-1 font-semibold text-ink-900">{user.full_name}</p>
            <p className="text-sm text-ink-700">{user.email}</p>
            {userRow?.mobile && <p className="text-sm text-ink-700">{userRow.mobile}</p>}
          </div>
          <div className="sm:text-right">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">Payment details</p>
            <p className="mt-1 text-sm text-ink-700">Method: <span className="uppercase">{payment.method ?? "—"}</span></p>
            <p className="text-sm text-ink-700">Razorpay order: <span className="font-mono text-xs">{payment.razorpay_order_id ?? "—"}</span></p>
            <p className="text-sm text-ink-700">Payment ID: <span className="font-mono text-xs">{payment.razorpay_payment_id ?? "—"}</span></p>
          </div>
        </section>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-y border-ink-100 text-left text-xs uppercase tracking-wider text-ink-500">
              <th className="py-2">Description</th><th className="py-2">Period</th><th className="py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-3 font-medium text-ink-900">Devbhoomi Prep Premium — {plan.name} plan</td>
              <td className="py-3 text-ink-700">{subscription ? `${formatDate(subscription.starts_at)} – ${formatDate(subscription.ends_at)}` : `${plan.duration_days} days`}</td>
              <td className="py-3 text-right text-ink-900">{formatINR(payment.amount / 100)}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr className="border-t border-ink-200">
              <td colSpan={2} className="py-3 text-right font-semibold text-ink-900">Total {payment.status === "refunded" ? "refunded" : "paid"}</td>
              <td className="py-3 text-right text-lg font-bold text-ink-900">{formatINR(payment.amount / 100)}</td>
            </tr>
          </tfoot>
        </table>

        <footer className="mt-6 border-t border-ink-100 pt-4 text-xs text-ink-500">
          <p>Amount is inclusive of all applicable taxes. This is a computer-generated receipt and does not require a signature.</p>
          <p className="mt-1">For refund requests, see our Refund Policy or write to {siteInfo.support_email ?? "support@devbhoomiprep.in"}.</p>
        </footer>
      </article>
    </div>
  );
}
