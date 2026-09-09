import { pageMetadata } from "@/lib/seo";
import { LegalLayout } from "@/components/marketing/legal-layout";

export const metadata = pageMetadata({ title: "Privacy Policy", description: "How Devbhoomi Prep collects, uses and protects your personal data.", path: "/privacy-policy" });

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout title="Privacy Policy" lastUpdated="1 September 2026" intro="This policy explains what information Devbhoomi Prep (“we”, “us”) collects when you use devbhoomiprep.in, why we collect it, and the choices you have.">
      <section>
        <h2>1. Information we collect</h2>
        <ul>
          <li><strong>Account details:</strong> full name, email address, mobile number, password (stored only as a salted hash), preferred exam and education level.</li>
          <li><strong>Learning activity:</strong> tests attempted, answers, scores, time taken, bookmarks, reading progress and study streaks. This powers your dashboard and analytics.</li>
          <li><strong>Payment information:</strong> plan purchased, amount, Razorpay order and payment identifiers, and payment status. Card, UPI and bank details are entered directly with Razorpay and never reach our servers.</li>
          <li><strong>Technical data:</strong> IP address, browser type, device and pages visited, collected through standard server logs and essential cookies.</li>
        </ul>
      </section>
      <section>
        <h2>2. How we use it</h2>
        <ul>
          <li>To create and secure your account, start your free trial and deliver the content and tests you request.</li>
          <li>To calculate results, percentiles, weak/strong subjects and recommendations.</li>
          <li>To process payments, issue receipts and manage subscription expiry.</li>
          <li>To send transactional emails such as verification, password reset and payment confirmations. Marketing emails are sent only with your consent and always include an unsubscribe link.</li>
          <li>To detect abuse, enforce our Terms and comply with law.</li>
        </ul>
      </section>
      <section>
        <h2>3. Cookies</h2>
        <p>We use a strictly necessary session cookie to keep you signed in and to protect against cross-site request forgery. We do not use third-party advertising cookies.</p>
      </section>
      <section>
        <h2>4. Sharing</h2>
        <p>We share data only with service providers needed to run the platform: our hosting and database provider (Supabase / cloud infrastructure), our payment gateway (Razorpay) and email delivery services. Each processes data under contract and only for our instructions. We do not sell personal data.</p>
      </section>
      <section>
        <h2>5. Retention & security</h2>
        <p>Account and learning data is retained while your account is active and for up to 24 months afterwards, unless you ask us to delete it sooner. Payment records are kept as required by Indian tax law. Data is encrypted in transit, passwords are hashed, and access is role-restricted.</p>
      </section>
      <section>
        <h2>6. Your rights</h2>
        <p>You can view and update your profile at any time from the Profile page. Email <a href="mailto:support@devbhoomiprep.in" className="text-brand-700 underline">support@devbhoomiprep.in</a> to request a copy of your data, correct it, or delete your account. We respond within 30 days.</p>
      </section>
      <section>
        <h2>7. Children</h2>
        <p>The platform is intended for users aged 16 and above preparing for government recruitment examinations.</p>
      </section>
      <section>
        <h2>8. Changes</h2>
        <p>We will post any material changes here and update the date above. Continued use after a change means you accept the updated policy.</p>
      </section>
    </LegalLayout>
  );
}
