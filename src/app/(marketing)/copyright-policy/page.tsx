import { pageMetadata } from "@/lib/seo";
import { LegalLayout } from "@/components/marketing/legal-layout";

export const metadata = pageMetadata({ title: "Copyright Policy", description: "What content Devbhoomi Prep publishes and how to report a copyright concern.", path: "/copyright-policy" });

export default function CopyrightPolicyPage() {
  return (
    <LegalLayout title="Copyright Policy" lastUpdated="1 September 2026" intro="We respect the rights of authors and publishers. This policy describes the content we host and how to raise a concern.">
      <section>
        <h2>1. What we publish</h2>
        <p>Every item in our library falls into one of these categories:</p>
        <ul>
          <li><strong>Original content</strong> written by the Devbhoomi Prep editorial team — notes, practice questions, solutions and study plans.</li>
          <li><strong>Licensed content</strong> used under a written agreement with the rights holder.</li>
          <li><strong>Public-domain material</strong>, including government publications and works whose copyright has expired.</li>
          <li><strong>Authorised PDFs</strong>, such as previous-year question papers published by examining bodies for public use, or files whose owner has permitted distribution.</li>
        </ul>
        <p>We do <strong>not</strong> upload or distribute copyrighted commercial books or coaching material without permission, and we remove any such file immediately if it reaches us.</p>
      </section>
      <section>
        <h2>2. Your use of our content</h2>
        <p>Material on the platform is for personal exam preparation only. Copying, sharing, re-uploading or selling our notes, questions or PDFs — including on Telegram, WhatsApp or YouTube — is a breach of our Terms and of copyright law.</p>
      </section>
      <section>
        <h2>3. Reporting a copyright concern (takedown request)</h2>
        <p>If you believe content on this platform infringes your copyright, email <a href="mailto:copyright@devbhoomiprep.in" className="text-brand-700 underline">copyright@devbhoomiprep.in</a> with:</p>
        <ul>
          <li>Your name, organisation and contact details.</li>
          <li>The URL(s) of the material on our site.</li>
          <li>A description of the copyrighted work and proof of ownership or authorisation to act for the owner.</li>
          <li>A statement, made in good faith, that the use is not authorised by the rights holder.</li>
        </ul>
        <p>We acknowledge valid notices within 2 working days, remove or disable access to the material while we review, and inform the uploader. Repeat infringers lose upload and account privileges.</p>
      </section>
      <section>
        <h2>4. Trademarks</h2>
        <p>UKPSC, UKSSSC, UBSE and other examination names are used only to describe the examinations our material relates to. We claim no association with, or endorsement by, those bodies.</p>
      </section>
    </LegalLayout>
  );
}
