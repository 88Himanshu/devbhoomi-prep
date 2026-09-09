import type { Metadata } from "next";
import { Shield } from "lucide-react";
import { PlatformNotice } from "@/components/static/platform-notice";

export const metadata: Metadata = { title: "Admin panel", robots: { index: false } };

export default function Page() {
  return <PlatformNotice icon={Shield} title="Admin panel" description="Admins manage students, exams, books, notes, papers, mock tests, questions (with CSV import), subscriptions, payments and homepage content." feature="The admin panel" />;
}
