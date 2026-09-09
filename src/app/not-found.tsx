import Link from "next/link";
import { Compass } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-ink-50 px-6 py-24 text-center">
      <Logo className="mb-10" />
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-brand-700 shadow-card"><Compass className="h-8 w-8" aria-hidden="true" /></span>
      <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-brand-600">404</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink-900">This page took a wrong turn in the hills</h1>
      <p className="mt-3 max-w-md text-sm text-ink-500">The page you are looking for doesn’t exist or has moved. Try one of these instead.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/">Go home</ButtonLink>
        <ButtonLink href="/exams" variant="outline">Browse exams</ButtonLink>
        <ButtonLink href="/search" variant="ghost">Search</ButtonLink>
      </div>
      <Link href="/contact" className="mt-8 text-sm text-ink-500 underline">Report a broken link</Link>
    </main>
  );
}
