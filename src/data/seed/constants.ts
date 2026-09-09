/** Fixed reference time so seed data is deterministic. */
export const SEED_NOW = "2026-09-01T09:00:00.000Z";

export function daysAgo(days: number, from: string = SEED_NOW): string {
  return new Date(new Date(from).getTime() - days * 86_400_000).toISOString();
}

export function daysFromNow(days: number, from: string = SEED_NOW): string {
  return new Date(new Date(from).getTime() + days * 86_400_000).toISOString();
}
