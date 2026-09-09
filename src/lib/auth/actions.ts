"use server";

import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { env, getBackend } from "@/lib/env";
import { adminDb, db } from "@/lib/data";
import type { Profile, User } from "@/lib/types";
import { getTrialSettings } from "@/lib/access";
import { createSessionToken, SESSION_COOKIE } from "./cookie";
import { sendMail } from "./mailer";
import { hashPassword, verifyPassword } from "./password";

export interface ActionResult {
  ok: boolean;
  error?: string;
  message?: string;
  fieldErrors?: Record<string, string>;
}

const emailSchema = z.string().trim().toLowerCase().email("Enter a valid email address");
const passwordSchema = z.string().min(8, "Password must be at least 8 characters");

const signUpSchema = z
  .object({
    full_name: z.string().trim().min(2, "Enter your full name").max(80),
    email: emailSchema,
    mobile: z
      .string()
      .trim()
      .regex(/^(\+91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}$/, "Enter a valid Indian mobile number"),
    password: passwordSchema,
    confirm_password: z.string(),
    preferred_exam_id: z.string().optional().nullable(),
    education_level: z.string().optional().nullable(),
  })
  .refine((d) => d.password === d.confirm_password, {
    path: ["confirm_password"],
    message: "Passwords do not match",
  });

function zodErrors(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

function safeNext(value: FormDataEntryValue | null, fallback = "/dashboard") {
  const s = typeof value === "string" ? value : "";
  return s.startsWith("/") && !s.startsWith("//") ? s : fallback;
}

async function setDemoSession(userId: string) {
  const { token, expires } = createSessionToken(userId);
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires,
    path: "/",
  });
}

/** Create the profile row and start the 30-day free trial. Shared by both backends. */
export async function startTrialProfile(userId: string, extra: Partial<Profile> = {}): Promise<Profile> {
  const trial = await getTrialSettings();
  const now = new Date();
  const profile: Profile = {
    user_id: userId,
    preferred_exam_id: extra.preferred_exam_id ?? null,
    education_level: extra.education_level ?? null,
    trial_started_at: now.toISOString(),
    trial_ends_at: new Date(now.getTime() + trial.trial_days * 86_400_000).toISOString(),
    study_streak_days: 0,
    last_active_date: null,
    updated_at: now.toISOString(),
  };
  return (await adminDb()).upsert("profiles", profile);
}

export async function signUp(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const parsed = signUpSchema.safeParse({
    full_name: formData.get("full_name"),
    email: formData.get("email"),
    mobile: formData.get("mobile"),
    password: formData.get("password"),
    confirm_password: formData.get("confirm_password"),
    preferred_exam_id: formData.get("preferred_exam_id") || null,
    education_level: formData.get("education_level") || null,
  });
  if (!parsed.success) return { ok: false, fieldErrors: zodErrors(parsed.error) };
  const input = parsed.data;

  if (getBackend() === "demo") {
    const store = await db();
    const existing = await store.selectOne("users", { eq: { email: input.email } });
    if (existing) return { ok: false, fieldErrors: { email: "An account with this email already exists" } };
    const token = randomBytes(24).toString("hex");
    const user = await store.insert("users", {
      email: input.email,
      full_name: input.full_name,
      mobile: input.mobile,
      role: "student",
      is_blocked: false,
      email_verified: false,
      password_hash: hashPassword(input.password),
      verification_token: token,
      reset_token: null,
      reset_token_expires_at: null,
    });
    await startTrialProfile(user.id, {
      preferred_exam_id: input.preferred_exam_id ?? null,
      education_level: input.education_level ?? null,
    });
    sendMail({
      to: user.email,
      subject: "Verify your email – Devbhoomi Prep",
      body: `Hi ${user.full_name}, confirm your email to secure your account. Your 30-day free trial has already started.`,
      link: `${env.APP_URL}/verify-email?token=${token}`,
    });
    await setDemoSession(user.id);
    redirect("/dashboard?welcome=1");
  }

  const { createSupabaseServerClient } = await import("@/lib/supabase/server");
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      emailRedirectTo: `${env.APP_URL}/auth/callback`,
      data: { full_name: input.full_name, mobile: input.mobile },
    },
  });
  if (error) return { ok: false, error: error.message };
  if (data.user) {
    // The users row is created by the DB trigger; ensure the profile + trial exist.
    await startTrialProfile(data.user.id, {
      preferred_exam_id: input.preferred_exam_id ?? null,
      education_level: input.education_level ?? null,
    });
  }
  if (!data.session) {
    return { ok: true, message: "Check your inbox to verify your email, then sign in. Your 30-day free trial starts now." };
  }
  redirect("/dashboard?welcome=1");
}

export async function signIn(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const parsed = z.object({ email: emailSchema, password: z.string().min(1, "Enter your password") }).safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { ok: false, fieldErrors: zodErrors(parsed.error) };
  const next = safeNext(formData.get("next"));

  if (getBackend() === "demo") {
    const store = await db();
    const user = await store.selectOne("users", { eq: { email: parsed.data.email } });
    if (!user || !verifyPassword(parsed.data.password, user.password_hash)) {
      return { ok: false, error: "Incorrect email or password" };
    }
    if (user.is_blocked) return { ok: false, error: "This account has been blocked. Contact support." };
    await setDemoSession(user.id);
    redirect(user.role === "admin" && next === "/dashboard" ? "/admin" : next);
  }

  const { createSupabaseServerClient } = await import("@/lib/supabase/server");
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { ok: false, error: "Incorrect email or password" };
  const row = await (await db()).selectOne("users", { eq: { email: parsed.data.email } });
  if (row?.is_blocked) {
    await supabase.auth.signOut();
    return { ok: false, error: "This account has been blocked. Contact support." };
  }
  redirect(row?.role === "admin" && next === "/dashboard" ? "/admin" : next);
}

export async function signOut() {
  if (getBackend() === "demo") {
    (await cookies()).delete(SESSION_COOKIE);
  } else {
    const { createSupabaseServerClient } = await import("@/lib/supabase/server");
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }
  redirect("/");
}

export async function forgotPassword(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const parsed = emailSchema.safeParse(formData.get("email"));
  if (!parsed.success) return { ok: false, fieldErrors: { email: parsed.error.issues[0].message } };
  const generic = { ok: true, message: "If an account exists for that email, a reset link has been sent." };

  if (getBackend() === "demo") {
    const store = await db();
    const user = await store.selectOne("users", { eq: { email: parsed.data } });
    if (user) {
      const token = randomBytes(24).toString("hex");
      await store.update("users", user.id, {
        reset_token: token,
        reset_token_expires_at: new Date(Date.now() + 3_600_000).toISOString(),
      });
      sendMail({
        to: user.email,
        subject: "Reset your password – Devbhoomi Prep",
        body: "Use the link below within 1 hour to choose a new password.",
        link: `${env.APP_URL}/reset-password?token=${token}`,
      });
    }
    return generic;
  }
  const { createSupabaseServerClient } = await import("@/lib/supabase/server");
  const supabase = await createSupabaseServerClient();
  await supabase.auth.resetPasswordForEmail(parsed.data, { redirectTo: `${env.APP_URL}/auth/callback?next=/reset-password` });
  return generic;
}

export async function resetPassword(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const parsed = z
    .object({ token: z.string().optional(), password: passwordSchema, confirm_password: z.string() })
    .refine((d) => d.password === d.confirm_password, { path: ["confirm_password"], message: "Passwords do not match" })
    .safeParse({
      token: formData.get("token") ?? undefined,
      password: formData.get("password"),
      confirm_password: formData.get("confirm_password"),
    });
  if (!parsed.success) return { ok: false, fieldErrors: zodErrors(parsed.error) };

  if (getBackend() === "demo") {
    const store = await db();
    const user = parsed.data.token
      ? await store.selectOne("users", { eq: { reset_token: parsed.data.token } })
      : null;
    if (!user || !user.reset_token_expires_at || new Date(user.reset_token_expires_at) < new Date()) {
      return { ok: false, error: "This reset link is invalid or has expired. Request a new one." };
    }
    await store.update("users", user.id, {
      password_hash: hashPassword(parsed.data.password),
      reset_token: null,
      reset_token_expires_at: null,
    });
    await setDemoSession(user.id);
    redirect("/dashboard?reset=1");
  }
  const { createSupabaseServerClient } = await import("@/lib/supabase/server");
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { ok: false, error: error.message };
  redirect("/dashboard?reset=1");
}

/** Demo backend email verification (Supabase handles this via /auth/callback). */
export async function verifyEmailToken(token: string): Promise<boolean> {
  if (getBackend() !== "demo") return false;
  const store = await db();
  const user = await store.selectOne("users", { eq: { verification_token: token } });
  if (!user) return false;
  await store.update("users", user.id, { email_verified: true, verification_token: null });
  return true;
}

export async function resendVerification(): Promise<ActionResult> {
  if (getBackend() !== "demo") {
    const { createSupabaseServerClient } = await import("@/lib/supabase/server");
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user?.email) return { ok: false, error: "Not signed in" };
    await supabase.auth.resend({ type: "signup", email: data.user.email });
    return { ok: true, message: "Verification email sent." };
  }
  const { getSessionUser } = await import("./session");
  const session = await getSessionUser();
  if (!session) return { ok: false, error: "Not signed in" };
  const store = await db();
  const user = (await store.getById("users", session.id)) as User;
  const token = user.verification_token ?? randomBytes(24).toString("hex");
  await store.update("users", user.id, { verification_token: token });
  sendMail({
    to: user.email,
    subject: "Verify your email – Devbhoomi Prep",
    body: "Confirm your email address to secure your account.",
    link: `${env.APP_URL}/verify-email?token=${token}`,
  });
  return { ok: true, message: "Verification email sent. In demo mode, open /dev/outbox to read it." };
}
