import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";
import { DemoAccountsHint } from "@/components/auth/demo-hint";

export const metadata: Metadata = { title: "Log in", robots: { index: false } };

export default async function LoginPage(props: PageProps<"/login">) {
  const sp = await props.searchParams;
  const nextRaw = typeof sp.next === "string" ? sp.next : undefined;
  const next = nextRaw && nextRaw.startsWith("/") && !nextRaw.startsWith("//") ? nextRaw : undefined;
  return (
    <AuthCard
      title="Welcome back"
      subtitle="Log in to continue your preparation."
      footer={<>New here? <Link href="/signup" className="font-semibold text-brand-700 hover:underline">Start your 30-day free trial</Link></>}
    >
      <LoginForm next={next} />
      <DemoAccountsHint />
    </AuthCard>
  );
}
