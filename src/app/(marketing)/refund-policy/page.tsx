import { pageMetadata } from "@/lib/seo";
import { LegalLayout } from "@/components/marketing/legal-layout";

export const metadata = pageMetadata({ title: "Refund Policy", description: "When and how Devbhoomi Prep issues refunds for premium plans.", path: "/refund-policy" });

export default function RefundPolicyPage() {
  return (
    <LegalLayout title="Refund Policy" lastUpdated="1 September 2026" intro="We want you to try the platform risk-free, which is why every account starts with a 30-day free trial. For paid plans, here is exactly when a refund applies.">
      <section>
        <h2>1. Eligibility for a full refund</h2>
        <p>You can request a <strong>full refund of your first purchase</strong> if all of the following are true:</p>
        <ul>
          <li>The request is made within <strong>7 days</strong> of the payment date.</li>
          <li>You have attempted <strong>fewer than 2 premium mock tests</strong> since the purchase.</li>
          <li>This is the first paid plan on your account.</li>
        </ul>
      </section>
      <section>
        <h2>2. When a refund is not available</h2>
        <ul>
          <li>Requests made more than 7 days after payment.</li>
          <li>Accounts that have attempted 2 or more premium mock tests, or downloaded premium PDFs, after the purchase.</li>
          <li>Renewals, extensions and second or later purchases.</li>
          <li>Accounts suspended for violating our Terms & Conditions.</li>
        </ul>
      </section>
      <section>
        <h2>3. How to request</h2>
        <p>Email <a href="mailto:support@devbhoomiprep.in" className="text-brand-700 underline">support@devbhoomiprep.in</a> from your registered email with the subject “Refund request”, your receipt/invoice number and the reason. We confirm eligibility within 3 working days.</p>
      </section>
      <section>
        <h2>4. Processing time</h2>
        <p>Approved refunds are returned to the original payment method through Razorpay within 5–7 working days. Bank processing can add a few days. Premium access is removed once the refund is issued.</p>
      </section>
      <section>
        <h2>5. Failed or duplicate payments</h2>
        <p>If money was deducted but your plan was not activated, it is usually reversed automatically by your bank within 5 working days. If not, contact us with the transaction reference and we will resolve it. Duplicate payments for the same plan are refunded in full.</p>
      </section>
    </LegalLayout>
  );
}
