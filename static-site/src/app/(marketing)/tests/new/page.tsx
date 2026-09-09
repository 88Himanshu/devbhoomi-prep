import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import { PlatformNotice } from "@/components/static/platform-notice";

export const metadata: Metadata = { title: "Build a custom test", robots: { index: false } };

export default function Page() {
  return <PlatformNotice icon={Sparkles} title="Build a custom test" description="Pick an exam, subject, difficulty and number of questions; the full platform assembles a fresh timed test from the question bank." feature="Custom tests" />;
}
