import Link from "next/link";
import { getSessionUser } from "@/lib/auth/session";
import { getAccess } from "@/lib/access";
import { Container } from "@/components/ui/misc";
import { ButtonLink } from "@/components/ui/button";
import { Logo } from "./logo";
import { HeaderNav, UserMenu } from "./site-header-client";
import { SearchBox } from "@/components/search/search-box";
import { Search } from "lucide-react";

export const PUBLIC_NAV = [
  { href: "/exams", label: "Exams" },
  { href: "/books", label: "Books" },
  { href: "/notes", label: "Notes" },
  { href: "/previous-year-papers", label: "PYQ Papers" },
  { href: "/mock-tests", label: "Mock Tests" },
  { href: "/pricing", label: "Pricing" },
];

export async function SiteHeader() {
  const user = await getSessionUser();
  const access = user ? await getAccess() : null;
  return (
    <header className="sticky top-0 z-40 border-b border-ink-200/80 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/75">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Logo />
        <HeaderNav items={PUBLIC_NAV} />
        <SearchBox className="hidden w-56 xl:block 2xl:w-72" />
        <div className="flex items-center gap-2">
          <Link href="/search" className="rounded-lg p-2 text-ink-700 hover:bg-ink-100 xl:hidden" aria-label="Search">
            <Search className="h-5 w-5" aria-hidden="true" />
          </Link>
          {user ? (
            <UserMenu
              user={{ name: user.full_name, email: user.email, role: user.role }}
              premium={Boolean(access?.subscriptionActive)}
              trialDaysLeft={access?.trialDaysLeft ?? 0}
            />
          ) : (
            <>
              <Link href="/login" className="hidden rounded-xl px-3.5 py-2 text-sm font-semibold text-ink-700 hover:bg-ink-100 sm:inline-flex">
                Log in
              </Link>
              <ButtonLink href="/signup" size="sm">Start Free Trial</ButtonLink>
            </>
          )}
        </div>
      </Container>
    </header>
  );
}
