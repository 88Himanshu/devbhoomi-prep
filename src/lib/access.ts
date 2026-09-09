import "server-only";
import { cache } from "react";
import { adminDb } from "@/lib/data";
import type { AccessState, PremiumFeature, SessionUser, Subscription, TrialSettings } from "@/lib/types";
import { getSessionUser } from "@/lib/auth/session";

export const DEFAULT_TRIAL: TrialSettings = {
  trial_days: 30,
  books: true,
  notes: true,
  papers: true,
  mock_tests: true,
  solutions: true,
  analytics: true,
};

export const getTrialSettings = cache(async (): Promise<TrialSettings> => {
  const row = await (await adminDb()).getById("settings", "trial");
  return { ...DEFAULT_TRIAL, ...((row?.value as Partial<TrialSettings>) ?? {}) };
});

export const ANONYMOUS_ACCESS: AccessState = {
  isAuthenticated: false,
  isAdmin: false,
  trialActive: false,
  trialDaysLeft: 0,
  trialEndsAt: null,
  subscriptionActive: false,
  subscription: null,
  isPremium: false,
  canAccess: () => false,
};

/**
 * Resolve the active subscription for a user, expiring stale rows on the way.
 * Uses adminDb so it works from webhooks and cron as well as request handlers.
 */
export async function getActiveSubscription(userId: string): Promise<Subscription | null> {
  const store = await adminDb();
  const rows = await store.select("subscriptions", {
    eq: { user_id: userId, status: "active" },
    order: [{ column: "ends_at", ascending: false }],
  });
  const now = Date.now();
  let active: Subscription | null = null;
  for (const sub of rows) {
    if (new Date(sub.ends_at).getTime() < now) {
      await store.update("subscriptions", sub.id, { status: "expired" });
    } else if (!active) {
      active = sub;
    }
  }
  return active;
}

/**
 * Reusable premium-access check. Premium content is available when
 *   trial_active = true  OR  subscription_active = true  (admins always).
 * Trial access can be narrowed per feature from the admin settings.
 */
export async function getAccessForUser(user: SessionUser | null): Promise<AccessState> {
  if (!user) return ANONYMOUS_ACCESS;
  const store = await adminDb();
  const [profile, subscription, trial] = await Promise.all([
    store.getById("profiles", user.id),
    getActiveSubscription(user.id),
    getTrialSettings(),
  ]);
  const now = Date.now();
  const trialEndsAt = profile?.trial_ends_at ?? null;
  const msLeft = trialEndsAt ? new Date(trialEndsAt).getTime() - now : 0;
  const trialActive = msLeft > 0;
  const trialDaysLeft = trialActive ? Math.ceil(msLeft / 86_400_000) : 0;
  const subscriptionActive = Boolean(subscription);
  const isAdmin = user.role === "admin";
  const isPremium = isAdmin || subscriptionActive || trialActive;

  const canAccess = (feature: PremiumFeature) => {
    if (isAdmin || subscriptionActive) return true;
    if (trialActive) return trial[feature] !== false;
    return false;
  };

  return {
    isAuthenticated: true,
    isAdmin,
    trialActive,
    trialDaysLeft,
    trialEndsAt,
    subscriptionActive,
    subscription,
    isPremium,
    canAccess,
  };
}

/** Per-request memoised access state for the signed-in user. */
export const getAccess = cache(async (): Promise<AccessState> => getAccessForUser(await getSessionUser()));

/** Route-handler guard: 401 when anonymous, 402 when premium is required but missing. */
export async function apiRequirePremium(feature: PremiumFeature): Promise<{ user: SessionUser; access: AccessState } | { error: Response }> {
  const user = await getSessionUser();
  if (!user) return { error: Response.json({ error: "Authentication required" }, { status: 401 }) };
  const access = await getAccessForUser(user);
  if (!access.canAccess(feature)) {
    return {
      error: Response.json({ error: "Premium subscription required", code: "PREMIUM_REQUIRED", feature }, { status: 402 }),
    };
  }
  return { user, access };
}
