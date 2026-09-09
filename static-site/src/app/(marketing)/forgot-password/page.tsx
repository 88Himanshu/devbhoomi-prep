import type { Metadata } from "next";
import { KeyRound } from "lucide-react";
import { PlatformNotice } from "@/components/static/platform-notice";

export const metadata: Metadata = { title: "Reset your password", robots: { index: false } };

export default function Page() {
  return <PlatformNotice icon={KeyRound} title="Reset your password" description="Password reset emails are sent by the full platform." feature="Password reset" />;
}
