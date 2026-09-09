import type { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { getAccessForUser } from "@/lib/access";
import { getObject, sanitizeKey } from "@/lib/storage";
import { findOwnerOfKey, incrementDownloads } from "@/lib/services/materials";

/**
 * Access-checked file delivery.
 *  - preview files: public
 *  - free item files: signed-in users
 *  - premium item files: users with trial/subscription access for that feature
 *  - admins: everything
 * Bundled sample files are still gated by the record that references them.
 */
export async function GET(request: NextRequest, ctx: RouteContext<"/api/files/[...key]">) {
  const { key: parts } = await ctx.params;
  let key: string;
  try {
    key = sanitizeKey(parts.join("/"));
  } catch {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const owner = await findOwnerOfKey(key);
  if (!owner) return Response.json({ error: "Not found" }, { status: 404 });
  const published = owner.kind === "paper" ? owner.record.is_published : owner.record.is_published;
  const user = await getSessionUser();
  const isAdmin = user?.role === "admin";
  if (!published && !isAdmin) return Response.json({ error: "Not found" }, { status: 404 });

  if (!owner.isPreview && !isAdmin) {
    if (!user) return Response.json({ error: "Authentication required" }, { status: 401 });
    if (owner.record.is_premium) {
      const access = await getAccessForUser(user);
      const feature = owner.kind === "paper" ? "papers" : owner.kind === "book" ? "books" : "notes";
      if (!access.canAccess(feature)) {
        return Response.json({ error: "Premium subscription required", code: "PREMIUM_REQUIRED", feature }, { status: 402 });
      }
    }
  }

  const file = await getObject(key);
  if (!file) return Response.json({ error: "Not found" }, { status: 404 });

  const download = request.nextUrl.searchParams.get("download") === "1";
  if (download) await incrementDownloads(owner);
  const filename = key.split("/").pop() ?? "file";
  return new Response(new Uint8Array(file.data), {
    headers: {
      "Content-Type": file.contentType,
      "Content-Length": String(file.data.length),
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${filename}"`,
      "Cache-Control": "private, max-age=0, must-revalidate",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
