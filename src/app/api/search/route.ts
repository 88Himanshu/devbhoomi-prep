import type { NextRequest } from "next/server";
import { suggest } from "@/lib/services/search";

export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get("q") ?? "").trim();
  if (q.length < 2) return Response.json({ suggestions: [] });
  const suggestions = await suggest(q);
  return Response.json({ suggestions }, { headers: { "Cache-Control": "private, max-age=30" } });
}
