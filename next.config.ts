import type { NextConfig } from "next";

const isStatic = process.env.NEXT_PUBLIC_STATIC_SITE === "1";

const nextConfig: NextConfig = {
  ...(isStatic
    ? {
        // GitHub Pages: fully static export served under /<repo>/
        output: "export",
        basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? "",
        trailingSlash: true,
        images: { unoptimized: true },
      }
    : {}),
  // Lets several dev servers run side by side (e.g. NEXT_DIST_DIR=.next-b next dev -p 3001)
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  typedRoutes: false,
  // The demo store reads/writes .data at runtime via a dynamic path; keep the traced
  // server bundle small by excluding folders that are never required at runtime.
  outputFileTracingExcludes: { "*": ["./public/**", "./.data/**", "./supabase/**", "./scripts/**", "./.next-*/**"] },
  ...(isStatic ? {} : { images: { remotePatterns: [] } }),
  ...(isStatic
    ? {}
    : {
      headers: async () => {
        return [
          {
            source: "/(.*)",
            headers: [
              { key: "X-Frame-Options", value: "SAMEORIGIN" },
              { key: "X-Content-Type-Options", value: "nosniff" },
              { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
              { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
            ],
          },
        ];
      },
    }),
};

export default nextConfig;
