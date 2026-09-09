import type { Metadata } from "next";
import { UserPlus } from "lucide-react";
import { PlatformNotice } from "@/components/static/platform-notice";

export const metadata: Metadata = { title: "Start your 30-day free trial", robots: { index: false } };

export default function Page() {
  return <PlatformNotice icon={UserPlus} title="Start your 30-day free trial" description="Sign-up creates a student account and starts a 30-day free trial with premium books, papers and mock tests." feature="Creating an account" />;
}
