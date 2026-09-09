import type { Metadata } from "next";
import Link from "next/link";
import { verifyEmailToken } from "@/lib/auth/actions";
import { getSessionUser } from "@/lib/auth/session";
import { AuthCard } from "@/components/auth/auth-card";
import { ResendVerificationButton } from "@/components/auth/resend-verification";
import { ButtonLink } from "@/components/ui/button";
import { Alert } from "@/components/ui/misc";

export const metadata: Metadata = { title: "Verify email", robots: { index: false } };

export default async function VerifyEmailPage(props: PageProps<"/verify-email">) {
  const sp = await props.searchParams;
  const token = typeof sp.token === "string" ? sp.token : undefined;
  const user = await getSessionUser();
  const verified = token ? await verifyEmailToken(token) : false;

  return (
    <AuthCard title="Email verification" subtitle="Confirm your email address to secure your account.">
      {token && verified && (
        <div className="grid gap-4">
          <Alert tone="success" title="Email verified">Thanks! Your email address is confirmed.</Alert>
          <ButtonLink href={user ? "/dashboard" : "/login"} className="w-full">{user ? "Go to dashboard" : "Log in"}</ButtonLink>
        </div>
      )}
      {token && !verified && (
        <div className="grid gap-4">
          <Alert tone="error" title="Link invalid or already used">This verification link is no longer valid.</Alert>
          {user && !user.email_verified ? <ResendVerificationButton /> : <Link href="/login" className="text-sm font-semibold text-brand-700 hover:underline">Log in</Link>}
        </div>
      )}
      {!token && (
        <div className="grid gap-4">
          {user?.email_verified ? (
            <Alert tone="success">Your email <span className="font-semibold">{user.email}</span> is already verified.</Alert>
          ) : user ? (
            <>
              <Alert tone="info">We sent a verification link to <span className="font-semibold">{user.email}</span>. Open it to confirm your address.</Alert>
              <ResendVerificationButton />
            </>
          ) : (
            <Alert tone="info">Log in to resend your verification email.</Alert>
          )}
          <ButtonLink href={user ? "/dashboard" : "/login"} variant="outline" className="w-full">{user ? "Go to dashboard" : "Log in"}</ButtonLink>
        </div>
      )}
    </AuthCard>
  );
}
