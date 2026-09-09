import { z } from "zod";
import { apiUser } from "@/lib/auth/session";
import { saveProgress } from "@/lib/services/progress";

const schema = z.object({
  item_type: z.enum(["book", "note", "exam"]),
  item_id: z.string().min(1).max(120),
  progress_percent: z.number().min(0).max(100),
  last_position: z.number().int().min(0).nullable().optional(),
  seconds_spent: z.number().int().min(0).max(3600).optional(),
});

export async function POST(request: Request) {
  const auth = await apiUser();
  if ("error" in auth) return auth.error;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid request" }, { status: 400 });
  const row = await saveProgress({
    userId: auth.user.id,
    type: parsed.data.item_type,
    itemId: parsed.data.item_id,
    progressPercent: parsed.data.progress_percent,
    lastPosition: parsed.data.last_position ?? null,
    secondsSpent: parsed.data.seconds_spent ?? 0,
  });
  return Response.json({ progress: row });
}
