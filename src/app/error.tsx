"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-ink-50 px-6 py-24 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-saffron-700 shadow-card"><TriangleAlert className="h-8 w-8" aria-hidden="true" /></span>
      <h1 className="mt-6 text-2xl font-bold tracking-tight text-ink-900">Something went wrong</h1>
      <p className="mt-2 max-w-md text-sm text-ink-500">An unexpected error occurred. You can try again, or head back to the homepage.</p>
      {error.digest && <p className="mt-2 text-xs text-ink-500">Reference: {error.digest}</p>}
      <div className="mt-8 flex gap-3">
        <Button onClick={reset}>Try again</Button>
        <ButtonLink href="/" variant="outline">Go home</ButtonLink>
      </div>
    </main>
  );
}
