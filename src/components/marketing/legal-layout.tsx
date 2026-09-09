import type { ReactNode } from "react";
import { Container } from "@/components/ui/misc";

export function LegalLayout({ title, lastUpdated, intro, children }: { title: string; lastUpdated: string; intro?: string; children: ReactNode }) {
  return (
    <Container className="max-w-3xl py-12 sm:py-16">
      <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">Legal</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">{title}</h1>
      <p className="mt-2 text-sm text-ink-500">Last updated: {lastUpdated}</p>
      {intro && <p className="mt-6 text-base text-ink-700">{intro}</p>}
      <div className="prose-dp mt-8 space-y-8 text-sm leading-relaxed text-ink-700 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-ink-900 [&_h2]:mb-3 [&_strong]:text-ink-900">
        {children}
      </div>
    </Container>
  );
}
