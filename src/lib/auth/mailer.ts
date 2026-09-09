import "server-only";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

export interface OutboxMail {
  id: string;
  to: string;
  subject: string;
  body: string;
  link: string | null;
  sent_at: string;
}

const OUTBOX = path.join(process.cwd(), ".data", "outbox.json");

/**
 * Demo-mode mailer. Real deployments use Supabase Auth emails (verification / reset)
 * or plug an SMTP provider in here. Messages are written to .data/outbox.json and
 * viewable at /dev/outbox while running locally.
 */
export function sendMail(mail: Omit<OutboxMail, "id" | "sent_at">) {
  const entry: OutboxMail = { ...mail, id: crypto.randomUUID(), sent_at: new Date().toISOString() };
  const list = readOutbox();
  list.unshift(entry);
  try {
    mkdirSync(path.dirname(OUTBOX), { recursive: true });
    writeFileSync(OUTBOX, JSON.stringify(list.slice(0, 100), null, 2));
  } catch (err) {
    console.warn("[mailer] could not write outbox", err);
  }
  console.info(`[mail → ${mail.to}] ${mail.subject}${mail.link ? `\n  ${mail.link}` : ""}`);
  return entry;
}

export function readOutbox(): OutboxMail[] {
  if (!existsSync(OUTBOX)) return [];
  try {
    return JSON.parse(readFileSync(OUTBOX, "utf8")) as OutboxMail[];
  } catch {
    return [];
  }
}
