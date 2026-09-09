import type { Metadata } from "next";
import Link from "next/link";
import { getBackend } from "@/lib/env";
import { AuthCard } from "@/components/auth/auth-card";
import { ResetPasswordForm } from "@/components/auth/reset-form";
import { Alert } from "@/components/ui/misc";

export const metadata: Metadata = { title: "Reset password", robots: { index: false } };

export default async function ResetPasswordPage(props: PageProps<"/reset-password">) {
  const sp = await props.searchParams;
  const token = typeof sp.token === "string" ? sp.token : undefined;
  const missing = getBackend() === "demo" && !token;
  return (
    <AuthCard
      title="Choose a new password"
      subtitle="Pick something strong you haven't used before."
      footer={<Link href="/login" className="font-semibold text-brand-700 hover:underline">← Back to log in</Link>}
    >
      {missing ? (
        <Alert tone="error" title="Invalid link">
          This reset link is missing its token. <Link href="/forgot-password" className="font-semibold underline">Request a new one</Link>.
        </Alert>
      ) : (
        <ResetPasswordForm token={token} />
      )}
    </AuthCard>
  );
}
