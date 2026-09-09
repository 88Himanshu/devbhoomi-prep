import Link from "next/link";
import { Container } from "@/components/ui/misc";
import { Logo } from "./logo";

const columns = [
  {
    title: "Exams",
    links: [
      ["UKPSC", "/exams/ukpsc"], ["UKSSSC", "/exams/uksssc"], ["Uttarakhand Police", "/exams/police"],
      ["Patwari / Lekhpal", "/exams/patwari-lekhpal"], ["Forest Guard", "/exams/forest-guard"], ["All exams", "/exams"],
    ],
  },
  {
    title: "Prepare",
    links: [["Books", "/books"], ["Notes", "/notes"], ["Previous Year Papers", "/previous-year-papers"], ["Mock Tests", "/mock-tests"], ["Pricing", "/pricing"], ["Search", "/search"]],
  },
  {
    title: "Company",
    links: [["About", "/about"], ["Contact Us", "/contact"], ["FAQ", "/#faq"], ["Refund Policy", "/refund-policy"]],
  },
  {
    title: "Legal",
    links: [["Privacy Policy", "/privacy-policy"], ["Terms & Conditions", "/terms"], ["Copyright Policy", "/copyright-policy"]],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-ink-200 bg-ink-50">
      <Container className="grid gap-10 py-14 md:grid-cols-[1.4fr_repeat(4,1fr)]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-ink-500">
            Study materials, previous-year papers and mock tests built for Uttarakhand government exam aspirants.
          </p>
          <p className="mt-4 text-xs text-ink-500">Dehradun, Uttarakhand · support@devbhoomiprep.in</p>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <p className="text-sm font-semibold text-ink-900">{col.title}</p>
            <ul className="mt-3 space-y-2">
              {col.links.map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-ink-500 hover:text-brand-700">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>
      <div className="border-t border-ink-200">
        <Container className="flex flex-col gap-2 py-5 text-xs text-ink-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Devbhoomi Prep. All rights reserved.</p>
          <p>Not affiliated with UKPSC, UKSSSC or any government body. Results depend on individual effort.</p>
        </Container>
      </div>
    </footer>
  );
}
