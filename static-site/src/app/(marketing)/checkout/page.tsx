import type { Metadata } from "next";
import { CreditCard } from "lucide-react";
import { PlatformNotice } from "@/components/static/platform-notice";

export const metadata: Metadata = { title: "Upgrade to Premium", robots: { index: false } };

export default function Page() {
  return <PlatformNotice icon={CreditCard} title="Upgrade to Premium" description="Monthly, 3-month and yearly plans are paid securely through Razorpay and verified on the server before access is activated." feature="Checkout" />;
}
