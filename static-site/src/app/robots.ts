// Static showcase copy: pre-rendered at export time.
export const dynamic = "force-static";

import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  const base = env.APP_URL.replace(/\/$/, "");
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/dashboard", "/tests", "/api", "/dev", "/checkout", "/profile", "/bookmarks", "/analytics"] }],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
