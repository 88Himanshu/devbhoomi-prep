import { z } from "zod";
import { apiUser } from "@/lib/auth/session";
import { listBookmarks, toggleBookmark } from "@/lib/services/bookmarks";

const bodySchema = z.object({
  type: z.enum(["book", "note", "question", "mock_test"]),
  item_id: z.string().min(1).max(120),
});

export async function GET(request: Request) {
  const auth = await apiUser();
  if ("error" in auth) return auth.error;
  const type = new URL(request.url).searchParams.get("type");
  const parsed = bodySchema.shape.type.safeParse(type);
  const rows = await listBookmarks(auth.user.id, parsed.success ? parsed.data : undefined);
  return Response.json({ bookmarks: rows });
}

export async function POST(request: Request) {
  const auth = await apiUser();
  if ("error" in auth) return auth.error;
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid request" }, { status: 400 });
  const bookmarked = await toggleBookmark(auth.user.id, parsed.data.type, parsed.data.item_id);
  return Response.json({ bookmarked });
}
