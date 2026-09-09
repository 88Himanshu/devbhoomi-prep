import "server-only";
import { db } from "@/lib/data";
import type { ProgressItemType, StudyProgress } from "@/lib/types";

export async function getProgress(userId: string, type: ProgressItemType, itemId: string): Promise<StudyProgress | null> {
  return (await db()).selectOne("study_progress", { eq: { user_id: userId, item_type: type, item_id: itemId } });
}

export async function listProgress(userId: string, type?: ProgressItemType): Promise<StudyProgress[]> {
  return (await db()).select("study_progress", {
    eq: { user_id: userId, ...(type ? { item_type: type } : {}) },
    order: [{ column: "updated_at", ascending: false }],
  });
}

/** Insert or update a progress row (unique per user/item). */
export async function saveProgress(opts: {
  userId: string;
  type: ProgressItemType;
  itemId: string;
  progressPercent: number;
  lastPosition?: number | null;
  secondsSpent?: number;
}): Promise<StudyProgress> {
  const store = await db();
  const existing = await getProgress(opts.userId, opts.type, opts.itemId);
  const percent = Math.max(0, Math.min(100, Math.round(opts.progressPercent)));
  const now = new Date().toISOString();
  if (existing) {
    return store.update("study_progress", existing.id, {
      progress_percent: Math.max(existing.progress_percent, percent),
      last_position: opts.lastPosition ?? existing.last_position,
      seconds_spent: existing.seconds_spent + (opts.secondsSpent ?? 0),
      updated_at: now,
    });
  }
  return store.insert("study_progress", {
    user_id: opts.userId,
    item_type: opts.type,
    item_id: opts.itemId,
    progress_percent: percent,
    last_position: opts.lastPosition ?? null,
    seconds_spent: opts.secondsSpent ?? 0,
    updated_at: now,
  });
}
