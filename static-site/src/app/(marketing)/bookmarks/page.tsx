import type { Metadata } from "next";
import { Bookmark } from "lucide-react";
import { PlatformNotice } from "@/components/static/platform-notice";

export const metadata: Metadata = { title: "My bookmarks", robots: { index: false } };

export default function Page() {
  return <PlatformNotice icon={Bookmark} title="My bookmarks" description="Save books, notes, questions and mock tests to revisit later." feature="Bookmarks" />;
}
