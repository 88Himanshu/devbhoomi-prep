import { BookOpenCheck, Compass, ShieldCheck, Users } from "lucide-react";
import { pageMetadata } from "@/lib/seo";
import { Container, PageHeader } from "@/components/ui/misc";
import { ButtonLink } from "@/components/ui/button";

export const metadata = pageMetadata({ title: "About Devbhoomi Prep", description: "Who we are and why we built an exam-preparation platform dedicated to Uttarakhand.", path: "/about" });

const VALUES = [
  { icon: Compass, title: "Uttarakhand first", text: "Every note, question and test is mapped to the syllabi of Uttarakhand recruitment bodies — not repackaged all-India material." },
  { icon: BookOpenCheck, title: "Accuracy over volume", text: "Our editorial team verifies facts against official sources and updates material when notifications change." },
  { icon: ShieldCheck, title: "Legal, original content", text: "We publish only original, licensed, public-domain or authorised material. No pirated books, ever." },
  { icon: Users, title: "Honest with students", text: "No selection guarantees, no inflated claims. Just realistic tests and analytics that show what to improve." },
];

export default function AboutPage() {
  return (
    <>
      <div className="border-b border-ink-200 bg-gradient-to-b from-brand-50 to-white">
        <Container className="py-12 sm:py-16">
          <PageHeader eyebrow="About us" title="Built in Dehradun for Uttarakhand aspirants" description="Devbhoomi Prep is a small team of educators, former aspirants and engineers who wanted a single, trustworthy place to prepare for the state's government exams." />
        </Container>
      </div>
      <Container className="space-y-14 py-12 sm:py-16">
        <div className="prose-dp max-w-3xl space-y-4 text-base leading-relaxed text-ink-700">
          <p>Students in the hills often prepare with photocopied notes, forwarded PDFs of uncertain origin and mock tests written for other states. We started Devbhoomi Prep to fix that: exam-specific notes in English and Hindi, papers from previous years you can actually attempt with a timer, and a dashboard that tells you where you stand.</p>
          <p>The platform runs on a simple promise. Everything you read here is legally sourced, everything you attempt here is scored the way the real exam scores it, and everything we tell you about your performance is based on your own data.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {VALUES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl border border-ink-200 bg-white p-6 shadow-card">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest-50 text-forest-700"><Icon className="h-5 w-5" aria-hidden="true" /></span>
              <h2 className="mt-4 text-base font-semibold text-ink-900">{title}</h2>
              <p className="mt-1.5 text-sm text-ink-500">{text}</p>
            </div>
          ))}
        </div>
        <div className="rounded-3xl bg-ink-50 p-8 text-center">
          <h2 className="text-xl font-bold text-ink-900">Want to contribute notes or report an error?</h2>
          <p className="mt-2 text-sm text-ink-500">We credit contributors and fix mistakes fast.</p>
          <ButtonLink href="/contact" className="mt-5">Contact us</ButtonLink>
        </div>
      </Container>
    </>
  );
}
