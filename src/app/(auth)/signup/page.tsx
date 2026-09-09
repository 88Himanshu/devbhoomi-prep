import type { Metadata } from "next";
import Link from "next/link";
import { getExams } from "@/lib/services/catalog";
import { AuthCard } from "@/components/auth/auth-card";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = { title: "Create your account", description: "Sign up and start a 30-day free trial of Devbhoomi Prep." };

export default async function SignupPage() {
  const exams = await getExams();
  return (
    <AuthCard
      title="Create your account"
      subtitle="Join thousands of Uttarakhand aspirants. Free for 30 days."
      footer={<>Already have an account? <Link href="/login" className="font-semibold text-brand-700 hover:underline">Log in</Link></>}
    >
      <SignupForm exams={exams.map((e) => ({ id: e.id, name: e.name }))} />
    </AuthCard>
  );
}
