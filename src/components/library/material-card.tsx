import Link from "next/link";
import { Eye, FileText, Languages } from "lucide-react";
import type { Exam, Material, Subject } from "@/lib/types";
import { Badge, FreeBadge, PremiumBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/misc";
import { formatNumber, LANGUAGE_LABELS } from "@/lib/utils";
import { BookmarkButton } from "@/components/bookmarks/bookmark-button";
import { MaterialCover } from "./material-cover";

export function MaterialCard({
  material,
  subject,
  exams,
  locked,
  bookmarked,
  showBookmark = true,
  progress,
}: {
  material: Material;
  subject?: Subject;
  exams: Exam[];
  locked: boolean;
  bookmarked?: boolean;
  showBookmark?: boolean;
  progress?: number | null;
}) {
  const href = `/${material.kind === "book" ? "books" : "notes"}/${material.slug}`;
  return (
    <Card hover className="group relative flex h-full flex-col overflow-hidden">
      <Link href={href} className="flex flex-1 flex-col p-4 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-100">
        <div className="flex gap-4">
          <MaterialCover title={material.title} color={material.cover_color} kind={material.kind} className="h-28 w-20 shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
              {material.is_premium ? <PremiumBadge locked={locked} /> : <FreeBadge />}
              {subject && <Badge tone="brand">{subject.name}</Badge>}
            </div>
            <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-ink-900 group-hover:text-brand-700">{material.title}</h3>
            <p className="mt-1 line-clamp-1 text-xs text-ink-500">{material.author}</p>
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-ink-500">
              <span className="inline-flex items-center gap-1"><Languages className="h-3 w-3" aria-hidden="true" />{LANGUAGE_LABELS[material.language]}</span>
              <span className="inline-flex items-center gap-1"><FileText className="h-3 w-3" aria-hidden="true" />{material.pages} pages</span>
              <span>{material.year}</span>
            </div>
          </div>
        </div>
        <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-ink-700">{material.description}</p>
        {exams.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {exams.slice(0, 3).map((e) => (
              <span key={e.id} className="rounded-md bg-ink-100 px-1.5 py-0.5 text-[10px] font-medium text-ink-700">{e.short_name}</span>
            ))}
            {exams.length > 3 && <span className="rounded-md bg-ink-100 px-1.5 py-0.5 text-[10px] font-medium text-ink-500">+{exams.length - 3}</span>}
          </div>
        )}
        {typeof progress === "number" && progress > 0 && (
          <div className="mt-3">
            <div className="mb-1 flex justify-between text-[11px] text-ink-500"><span>Continue reading</span><span>{progress}%</span></div>
            <Progress value={progress} tone="forest" label="Reading progress" />
          </div>
        )}
        <div className="mt-auto flex items-center justify-between pt-3 text-[11px] text-ink-500">
          <span className="inline-flex items-center gap-1"><Eye className="h-3 w-3" aria-hidden="true" />{formatNumber(material.views)} views</span>
          <span className="font-medium text-brand-700">View details →</span>
        </div>
      </Link>
      {showBookmark && (
        <div className="absolute right-3 top-3">
          <BookmarkButton type={material.kind} itemId={material.id} initial={bookmarked} size="sm" />
        </div>
      )}
    </Card>
  );
}
