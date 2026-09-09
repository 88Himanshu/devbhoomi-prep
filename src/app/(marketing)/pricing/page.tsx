import Link from "next/link";
import { getSessionUser } from "@/lib/auth/session";
import { getAccess } from "@/lib/access";
import { JsonLd, breadcrumbJsonLd, faqJsonLd, pageMetadata } from "@/lib/seo";
import { Container, PageHeader, SectionHeading } from "@/components/ui/misc";
import { ComparisonTable, PricingCards, SecurePaymentNote } from "@/components/marketing/pricing";
import { FAQ_ITEMS, Faq } from "@/components/marketing/faq";
import { Alert } from "@/components/ui/misc";
import { formatDate } from "@/lib/utils";

export const metadata = pageMetadata({
  title: "Pricing – Free 30-day trial, then from ₹199/month",
  description: "Start with a 30-day free trial. Premium plans from ₹199/month unlock the full books & notes library, all previous-year papers, unlimited mock tests, solutions and analytics.",
  path: "/pricing",
});

const PRICING_FAQ = FAQ_ITEMS.filter((f) => /trial|refund|ends/i.test(f.q)).concat([
  { q: "Can I switch plans later?", a: "Yes. Buying a new plan while one is active simply extends your premium access from the current end date." },
  { q: "Which payment methods are supported?", a: "UPI, debit and credit cards, net banking and popular wallets through Razorpay. We never store your card details." },
]);

export default async function PricingPage() {
  const [user, access] = await Promise.all([getSessionUser(), getAccess()]);
  return (
    <>
      <JsonLd data={[faqJsonLd(PRICING_FAQ), breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Pricing", path: "/pricing" }])]} />
      <div className="border-b border-ink-200 bg-gradient-to-b from-brand-50 to-white">
        <Container className="py-12 text-center sm:py-16">
          <PageHeader eyebrow="Pricing" title="Simple plans for serious preparation" description="Every new account starts with 30 days free. Upgrade any time to unlock the complete library, all papers and unlimited mock tests." className="items-center text-center sm:flex-col sm:items-center [&>div]:mx-auto" />
        </Container>
      </div>
      <Container className="space-y-16 py-12 sm:py-16">
        {access.subscriptionActive && access.subscription && (
          <Alert tone="success" title={`You are on the ${access.subscription.plan_id} plan`}>
            Premium access is active until {formatDate(access.subscription.ends_at)}. Buying another plan extends it from that date.
          </Alert>
        )}
        {!access.subscriptionActive && access.trialActive && (
          <Alert tone="info" title={`Your free trial ends in ${access.trialDaysLeft} ${access.trialDaysLeft === 1 ? "day" : "days"}`}>
            Upgrade now to keep premium access without interruption.
          </Alert>
        )}
        <div className="pt-4">
          <PricingCards signedIn={Boolean(user)} access={access} />
          <div className="mt-6"><SecurePaymentNote /></div>
        </div>
        <section aria-labelledby="compare-h">
          <SectionHeading eyebrow="Compare" title="What's included in each plan" className="mb-6" />
          <ComparisonTable />
        </section>
        <section className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]" aria-labelledby="faq-h">
          <div>
            <SectionHeading eyebrow="Questions" title="Pricing FAQ" />
            <p className="mt-3 text-base text-ink-500">Still unsure? <Link href="/contact" className="text-brand-700 underline">Contact us</Link> and we will help.</p>
          </div>
          <Faq items={PRICING_FAQ} />
        </section>
      </Container>
    </>
  );
}
