import type { Metadata } from "next";
import { UserRound } from "lucide-react";
import { PlatformNotice } from "@/components/static/platform-notice";

export const metadata: Metadata = { title: "Profile & subscription", robots: { index: false } };

export default function Page() {
  return <PlatformNotice icon={UserRound} title="Profile & subscription" description="Edit your profile, view subscription status, payment history and receipts." feature="Your profile" />;
}
