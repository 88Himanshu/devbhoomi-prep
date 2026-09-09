import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { ForgotPasswordForm } from "@/components/auth/forgot-form";

export const metadata: Metadata = { title: "Forgot password", robots: { index: false } };

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a link to reset it."
      footer={<Link href="/login" className="font-semibold text-brand-700 hover:underline">← Back to log in</Link>}
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
