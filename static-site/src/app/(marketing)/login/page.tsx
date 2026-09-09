import type { Metadata } from "next";
import { LogIn } from "lucide-react";
import { PlatformNotice } from "@/components/static/platform-notice";

export const metadata: Metadata = { title: "Log in", robots: { index: false } };

export default function Page() {
  return <PlatformNotice icon={LogIn} title="Log in" description="Student accounts, sessions and email verification are part of the full platform." feature="Logging in" />;
}
