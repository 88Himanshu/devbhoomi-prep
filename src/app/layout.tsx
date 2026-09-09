import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { env } from "@/lib/env";
import { getSessionUser } from "@/lib/auth/session";
import { MobileBottomNav } from "@/components/layout/mobile-nav";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(env.APP_URL),
  title: {
    default: "Devbhoomi Prep – Uttarakhand Competitive Exam Preparation",
    template: "%s | Devbhoomi Prep",
  },
  description:
    "Prepare for UKPSC, UKSSSC, Uttarakhand Police, Patwari, VDO, Forest Guard and other Uttarakhand government exams with study materials, previous-year papers, mock tests and performance analytics.",
  openGraph: {
    type: "website",
    siteName: "Devbhoomi Prep",
    locale: "en_IN",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Devbhoomi Prep" }],
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { themeColor: "#163e86", width: "device-width", initialScale: 1 };

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const user = await getSessionUser();
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        {children}
        {user?.role === "student" && <MobileBottomNav />}
      </body>
    </html>
  );
}
