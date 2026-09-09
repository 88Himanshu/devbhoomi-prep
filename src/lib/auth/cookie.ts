import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "@/lib/env";

export const SESSION_COOKIE = "dp_session";
const SESSION_DAYS = 30;

function sign(payload: string) {
  return createHmac("sha256", env.SESSION_SECRET).update(payload).digest("base64url");
}

/** Demo backend session token: `<userId>.<expiresAtMs>.<hmac>` */
export function createSessionToken(userId: string): { token: string; expires: Date } {
  const expires = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  const payload = `${userId}.${expires.getTime()}`;
  return { token: `${payload}.${sign(payload)}`, expires };
}

export function parseSessionToken(token: string | undefined): string | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [userId, exp, sig] = parts;
  const expected = sign(`${userId}.${exp}`);
  if (sig.length !== expected.length) return null;
  if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  if (Number(exp) < Date.now()) return null;
  return userId;
}
