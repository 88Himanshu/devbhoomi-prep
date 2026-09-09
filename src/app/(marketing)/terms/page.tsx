import { pageMetadata } from "@/lib/seo";
import { LegalLayout } from "@/components/marketing/legal-layout";

export const metadata = pageMetadata({ title: "Terms & Conditions", description: "The terms that govern your use of Devbhoomi Prep.", path: "/terms" });

export default function TermsPage() {
  return (
    <LegalLayout title="Terms & Conditions" lastUpdated="1 September 2026" intro="By creating an account or using devbhoomiprep.in you agree to these terms. Please read them carefully.">
      <section>
        <h2>1. The service</h2>
        <p>Devbhoomi Prep provides study material, previous-year question papers, mock tests and analytics for candidates preparing for Uttarakhand state government examinations. We are an independent private platform and are not affiliated with UKPSC, UKSSSC, UBSE or any government body. Official notifications, syllabi and results are published only by those bodies.</p>
      </section>
      <section>
        <h2>2. Accounts</h2>
        <ul>
          <li>You must provide accurate details and keep your password confidential. You are responsible for activity under your account.</li>
          <li>One account per person. Sharing accounts or reselling access is prohibited and may lead to suspension without refund.</li>
          <li>We may block accounts that abuse the platform, attempt to scrape or redistribute content, or violate these terms.</li>
        </ul>
      </section>
      <section>
        <h2>3. Free trial and subscriptions</h2>
        <ul>
          <li>New accounts receive a 30-day free trial with access to selected premium features. The trial ends automatically; no payment is taken unless you buy a plan.</li>
          <li>Paid plans (Monthly, 3 Months, Yearly) are prepaid for a fixed period and do not auto-renew. Premium access ends on the plan expiry date unless you purchase again.</li>
          <li>Prices are in Indian Rupees and include applicable taxes unless stated otherwise. Payments are processed by Razorpay.</li>
          <li>Refunds are governed by our Refund Policy.</li>
        </ul>
      </section>
      <section>
        <h2>4. Content and licence</h2>
        <p>All notes, books, questions, solutions and analytics on the platform are either created by us, licensed to us, in the public domain or distributed with authorisation. We grant you a personal, non-transferable licence to use them for your own exam preparation. You may not copy, share, sell, publish or redistribute any material, including downloaded PDFs.</p>
      </section>
      <section>
        <h2>5. No guarantee of results</h2>
        <p>We work hard to keep content accurate and tests realistic, but we make no promise about selection, marks or ranks. Examination outcomes depend on your effort and on the official examination process. Mock test scores and percentiles are indicative only.</p>
      </section>
      <section>
        <h2>6. Acceptable use</h2>
        <p>Do not attempt to access other users’ data, interfere with the service, use automated tools to download content, or upload unlawful material. Mock tests are for practice; cheating tools or answer sharing communities that use our questions violate these terms.</p>
      </section>
      <section>
        <h2>7. Liability</h2>
        <p>To the extent permitted by law, our total liability for any claim relating to the service is limited to the amount you paid us in the 12 months before the claim. We are not liable for indirect losses, including lost opportunities in any examination.</p>
      </section>
      <section>
        <h2>8. Governing law</h2>
        <p>These terms are governed by the laws of India. Courts in Dehradun, Uttarakhand have exclusive jurisdiction.</p>
      </section>
      <section>
        <h2>9. Contact</h2>
        <p>Questions about these terms: <a href="mailto:support@devbhoomiprep.in" className="text-brand-700 underline">support@devbhoomiprep.in</a>.</p>
      </section>
    </LegalLayout>
  );
}
