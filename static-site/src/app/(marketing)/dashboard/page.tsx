import type { Metadata } from "next";
import { LayoutDashboard } from "lucide-react";
import { PlatformNotice } from "@/components/static/platform-notice";

export const metadata: Metadata = { title: "Student dashboard", robots: { index: false } };

export default function Page() {
  return <PlatformNotice icon={LayoutDashboard} title="Student dashboard" description="Your personalised dashboard shows trial status, tests attempted, average score, accuracy, weak subjects, study streak and progress charts." feature="The student dashboard" />;
}
