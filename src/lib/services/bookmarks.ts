import "server-only";
import { db } from "@/lib/data";
import type { Bookmark, BookmarkType } from "@/lib/types";

export async function listBookmarks(userId: string, type?: BookmarkType): Promise<Bookmark[]> {
  return (await db()).select("bookmarks", {
    eq: { user_id: userId, ...(type ? { item_type: type } : {}) },
    order: [{ column: "created_at", ascending: false }],
  });
}

export async function isBookmarked(userId: string, type: BookmarkType, itemId: string): Promise<boolean> {
  return Boolean(await (await db()).selectOne("bookmarks", { eq: { user_id: userId, item_type: type, item_id: itemId } }));
}

export async function bookmarkedIds(userId: string, type: BookmarkType): Promise<Set<string>> {
  return new Set((await listBookmarks(userId, type)).map((b) => b.item_id));
}

/** Idempotent toggle. Returns the new state. */
export async function toggleBookmark(userId: string, type: BookmarkType, itemId: string): Promise<boolean> {
  const store = await db();
  const existing = await store.selectOne("bookmarks", { eq: { user_id: userId, item_type: type, item_id: itemId } });
  if (existing) {
    await store.delete("bookmarks", existing.id);
    return false;
  }
  await store.insert("bookmarks", { user_id: userId, item_type: type, item_id: itemId });
  return true;
}
