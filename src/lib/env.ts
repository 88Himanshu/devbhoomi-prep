/**
 * Central environment access. The app runs in one of two backends:
 *  - "demo": no Supabase env → local JSON store + cookie sessions (zero config)
 *  - "supabase": NEXT_PUBLIC_SUPABASE_URL + keys present → Postgres, Supabase Auth & Storage
 */
export const env = {
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET,
  SESSION_SECRET: process.env.SESSION_SECRET ?? "devbhoomi-dev-secret-change-me",
  APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  STORAGE_BUCKET: process.env.SUPABASE_STORAGE_BUCKET ?? "materials",
};

/**
 * Static showcase build (GitHub Pages). No server: sessions, APIs, payments and admin
 * are replaced by "available on the full platform" pages. Set by scripts/build-static.mjs.
 */
export const isStaticSite = () => process.env.NEXT_PUBLIC_STATIC_SITE === "1";
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export type Backend = "demo" | "supabase";

export function getBackend(): Backend {
  return env.SUPABASE_URL && env.SUPABASE_ANON_KEY ? "supabase" : "demo";
}

export const isDemoMode = () => getBackend() === "demo";

/** Razorpay is "live" only when both keys exist; otherwise checkout runs in sandbox mode. */
export const isRazorpayConfigured = () => Boolean(env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET);
