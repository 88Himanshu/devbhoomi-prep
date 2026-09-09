import type { Metadata } from "next";
import { LineChart } from "lucide-react";
import { PlatformNotice } from "@/components/static/platform-notice";

export const metadata: Metadata = { title: "Performance analytics", robots: { index: false } };

export default function Page() {
  return <PlatformNotice icon={LineChart} title="Performance analytics" description="Score history, accuracy by subject, weak and strong subjects, time management and improvement over time." feature="Analytics" />;
}
