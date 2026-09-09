import { Mail, MapPin, Phone, Send } from "lucide-react";
import { db } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";
import { Container, PageHeader } from "@/components/ui/misc";
import { ButtonLink } from "@/components/ui/button";

export const metadata = pageMetadata({ title: "Contact Us", description: "Reach the Devbhoomi Prep team for support, content corrections, refunds or partnerships.", path: "/contact" });

/** Static showcase: the contact form posts to a server action on the full platform; here we link to email instead. */
export default async function ContactPage() {
  const site = (await (await db()).getById("settings", "site"))?.value as Record<string, string> | undefined;
  const email = site?.support_email ?? "support@devbhoomiprep.in";
  const phone = site?.support_phone ?? "+91 94100 00000";
  const address = site?.address ?? "Dehradun, Uttarakhand";
  const mailto = `mailto:${email}?subject=${encodeURIComponent("Devbhoomi Prep enquiry")}`;
  return (
    <>
      <div className="border-b border-ink-200 bg-gradient-to-b from-brand-50 to-white">
        <Container className="py-12 sm:py-16">
          <PageHeader eyebrow="Contact" title="We're here to help" description="Support, content corrections, refund requests, copyright notices or partnership ideas — send us a message." />
        </Container>
      </div>
      <Container className="grid gap-10 py-12 lg:grid-cols-[320px_1fr] sm:py-16">
        <aside className="space-y-4">
          <ContactItem icon={Mail} label="Email" value={email} href={`mailto:${email}`} hint="Replies within 1 working day" />
          <ContactItem icon={Phone} label="Phone / WhatsApp" value={phone} href={`tel:${phone.replace(/\s+/g, "")}`} hint="Mon–Sat, 10am–6pm IST" />
          <ContactItem icon={MapPin} label="Office" value={address} hint="By appointment" />
        </aside>
        <div className="rounded-2xl border border-ink-200 bg-white p-6 shadow-card sm:p-8">
          <h2 className="text-lg font-semibold text-ink-900">Send a message</h2>
          <p className="mt-1 text-sm text-ink-500">For refunds, include your invoice number. For content errors, include the page or test name and question number.</p>
          <ButtonLink href={mailto} className="mt-6"><Send className="h-4 w-4" aria-hidden="true" /> Email {email}</ButtonLink>
          <p className="mt-3 text-xs text-ink-500">The in-page contact form is available on the full platform.</p>
        </div>
      </Container>
    </>
  );
}

function ContactItem({ icon: Icon, label, value, href, hint }: { icon: typeof Mail; label: string; value: string; href?: string; hint?: string }) {
  return (
    <div className="flex gap-3 rounded-2xl border border-ink-200 bg-white p-4 shadow-card">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700"><Icon className="h-5 w-5" aria-hidden="true" /></span>
      <div className="min-w-0">
        <p className="text-xs text-ink-500">{label}</p>
        {href ? <a href={href} className="block truncate text-sm font-semibold text-ink-900 hover:text-brand-700">{value}</a> : <p className="text-sm font-semibold text-ink-900">{value}</p>}
        {hint && <p className="text-xs text-ink-500">{hint}</p>}
      </div>
    </div>
  );
}
