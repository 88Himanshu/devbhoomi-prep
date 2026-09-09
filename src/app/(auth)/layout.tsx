import type { ReactNode } from "react";
import Link from "next/link";
import { Logo } from "@/components/layout/logo";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex flex-1 flex-col bg-ink-50">
      <div className="flex items-center justify-between px-6 py-5">
        <Logo />
        <Link href="/" className="text-sm font-medium text-ink-500 hover:text-brand-700">← Back to site</Link>
      </div>
      <div className="flex flex-1 items-start justify-center px-4 pb-16 pt-4 sm:pt-8">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </main>
  );
}
