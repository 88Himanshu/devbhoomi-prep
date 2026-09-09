import { ChevronDown } from "lucide-react";

export interface FaqItem { q: string; a: string }

export const FAQ_ITEMS: FaqItem[] = [
  { q: "What is included in the 30-day free trial?", a: "Every new account gets 30 days of access to selected premium books, notes, previous-year papers and mock tests, plus the full student dashboard. No card is needed to start." },
  { q: "What happens when my trial ends?", a: "Premium materials and premium mock tests are locked automatically. Free materials, free tests, your dashboard, bookmarks and past results remain available." },
  { q: "Which exams do you cover?", a: "UKPSC, UKSSSC, Uttarakhand Police, Patwari / Lekhpal, VDO, Junior Assistant, Forest Guard, Group C exams, teaching exams and UTET, with more added regularly." },
  { q: "Is the study material legal to use?", a: "Yes. We only publish original notes written by our editorial team, licensed content, public-domain material and PDFs we are authorised to distribute. We do not upload copyrighted commercial books." },
  { q: "How do mock tests work?", a: "Choose an exam, subject, difficulty and number of questions, then attempt the test with a countdown timer, question palette and mark-for-review. After submitting you get your score, accuracy, time analysis and detailed solutions." },
  { q: "Can I retake a test?", a: "Yes. Every mock test can be retaken as many times as you like, and your score history shows how you improve over time." },
  { q: "What is your refund policy?", a: "If you have attempted fewer than 2 premium mock tests, you can request a full refund within 7 days of your first purchase. Details are in our Refund Policy." },
  { q: "Do you guarantee selection?", a: "No platform can. We give you accurate content, realistic tests and honest analytics; results depend on your preparation and the official exam process." },
];

export function Faq({ items = FAQ_ITEMS }: { items?: FaqItem[] }) {
  return (
    <div className="divide-y divide-ink-200 rounded-2xl border border-ink-200 bg-white shadow-card">
      {items.map((it) => (
        <details key={it.q} className="group px-5 py-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-ink-900 [&::-webkit-details-marker]:hidden">
            {it.q}
            <ChevronDown className="h-4 w-4 shrink-0 text-ink-500 transition-transform group-open:rotate-180" aria-hidden="true" />
          </summary>
          <p className="mt-3 text-sm leading-relaxed text-ink-700">{it.a}</p>
        </details>
      ))}
    </div>
  );
}
