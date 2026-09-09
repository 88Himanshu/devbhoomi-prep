import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, Calendar, Download, Eye, FileText, ScrollText, ShieldCheck, User } from "lucide-react";
import type { Material } from "@/lib/types";
import { getSessionUser } from "@/lib/auth/session";
import { getAccess } from "@/lib/access";
import { getExamMap, getMaterialBySlug, getSubjectMap } from "@/lib/services/catalog";
import { featureFor, getRelatedMaterials, incrementViews } from "@/lib/services/materials";
import { isBookmarked, bookmarkedIds } from "@/lib/services/bookmarks";
import { getProgress } from "@/lib/services/progress";
import { fileUrl } from "@/lib/storage";
import { env } from "@/lib/env";
import { formatDate, formatNumber, LANGUAGE_LABELS } from "@/lib/utils";
import { Badge, FreeBadge, PremiumBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, Breadcrumbs, Container, PremiumLock, SectionHeading } from "@/components/ui/misc";
import { BookmarkButton } from "@/components/bookmarks/bookmark-button";
import { MaterialCard } from "./material-card";
import { MaterialCover } from "./material-cover";
import { MaterialReader } from "./material-reader";

const LICENSE_LABELS: Record<Material["source_license"], string> = {
  original: "Original content by Devbhoomi Prep",
  licensed: "Licensed content",
  public_domain: "Public domain",
  authorized: "Authorised for distribution",
};

export async function MaterialDetail({ kind, slug }: { kind: "book" | "note"; slug: string }) {
  const material = await getMaterialBySlug(kind, slug);
  if (!material || !material.is_published) notFound();
  const basePath = kind === "book" ? "/books" : "/notes";
  const label = kind === "book" ? "Books" : "Notes";

  const [user, access, subjectMap, examMap, related] = await Promise.all([
    getSessionUser(), getAccess(), getSubjectMap(), getExamMap(), getRelatedMaterials(material),
  ]);
  const [saved, relatedSaved, progress] = user
    ? await Promise.all([isBookmarked(user.id, kind, material.id), bookmarkedIds(user.id, kind), getProgress(user.id, kind, material.id)])
    : [false, new Set<string>(), null];
  await incrementViews(material);

  const subject = subjectMap.get(material.subject_id);
  const exams = material.exam_ids.map((id) => examMap.get(id)).filter(Boolean) as NonNullable<ReturnType<typeof examMap.get>>[];
  const hasAccessFeature = access.canAccess(featureFor(kind));
  const canRead = access.isAdmin || (material.is_premium ? hasAccessFeature : Boolean(user));
  const lockedPremium = material.is_premium && !canRead;
  const readUrl = material.file_path ? fileUrl(material.file_path) : null;
  const previewUrl = material.preview_path ? fileUrl(material.preview_path) : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": kind === "book" ? "Book" : "CreativeWork",
    name: material.title,
    description: material.description,
    author: { "@type": "Organization", name: material.author },
    inLanguage: material.language === "hi" ? "hi" : material.language === "bilingual" ? ["en", "hi"] : "en",
    datePublished: String(material.year),
    numberOfPages: material.pages,
    isAccessibleForFree: !material.is_premium,
    url: `${env.APP_URL}${basePath}/${material.slug}`,
    about: subject?.name,
  };

  return (
    <Container className="py-8 sm:py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label, href: basePath }, { label: material.title }]} />

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0">
          <div className="flex flex-col gap-6 sm:flex-row">
            <MaterialCover title={material.title} color={material.cover_color} kind={kind} size="lg" className="h-56 w-40 shrink-0 self-start" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {material.is_premium ? <PremiumBadge locked={lockedPremium} /> : <FreeBadge />}
                {subject && <Badge tone="brand">{subject.name}</Badge>}
                <Badge tone="outline">{LANGUAGE_LABELS[material.language]}</Badge>
              </div>
              <h1 className="mt-3 text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">{material.title}</h1>
              <p className="mt-2 flex items-center gap-1.5 text-sm text-ink-500"><User className="h-4 w-4" aria-hidden="true" />{material.author}</p>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                <Meta icon={FileText} label="Pages" value={String(material.pages)} />
                <Meta icon={Calendar} label="Edition" value={String(material.year)} />
                <Meta icon={Eye} label="Views" value={formatNumber(material.views)} />
                <Meta icon={Download} label="Downloads" value={formatNumber(material.downloads)} />
              </dl>
              {exams.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">Useful for</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {exams.map((e) => (
                      <Link key={e.id} href={`/exams/${e.slug}`} className="rounded-lg border border-ink-200 px-2.5 py-1 text-xs font-medium text-ink-700 hover:border-brand-300 hover:text-brand-700">{e.short_name}</Link>
                    ))}
                  </div>
                </div>
              )}
              <div className="mt-5 flex flex-wrap items-center gap-2">
                {previewUrl && <ButtonLink href={previewUrl} variant="outline" target="_blank" rel="noopener"><ScrollText className="h-4 w-4" />Preview</ButtonLink>}
                {canRead && readUrl && (
                  <>
                    <ButtonLink href="#reader"><BookOpen className="h-4 w-4" />{progress && progress.progress_percent > 0 ? `Continue reading · ${progress.progress_percent}%` : "Read Online"}</ButtonLink>
                    <ButtonLink href={fileUrl(material.file_path!, { download: true })} variant="forest"><Download className="h-4 w-4" />Download</ButtonLink>
                  </>
                )}
                {!user && !material.is_premium && <ButtonLink href={`/login?next=${encodeURIComponent(`${basePath}/${material.slug}`)}`}><BookOpen className="h-4 w-4" />Log in to read free</ButtonLink>}
                <BookmarkButton type={kind} itemId={material.id} initial={saved} showLabel />
              </div>
            </div>
          </div>

          <section className="mt-8">
            <h2 className="text-lg font-semibold text-ink-900">About this {kind}</h2>
            <p className="prose-dp mt-2 text-sm leading-relaxed text-ink-700 sm:text-base">{material.description}</p>
          </section>

          <section id="reader" className="mt-8 scroll-mt-24">
            <h2 className="mb-3 text-lg font-semibold text-ink-900">Read online</h2>
            {lockedPremium ? (
              !user ? (
                <div className="rounded-card border border-brand-200 bg-brand-50 px-6 py-10 text-center">
                  <p className="font-semibold text-ink-900">This is premium {kind === "book" ? "book" : "study material"}</p>
                  <p className="mt-1 text-sm text-ink-700">Create a free account to start your 30-day trial and read it online instantly.</p>
                  <div className="mt-4 flex justify-center gap-2">
                    <ButtonLink href="/signup" size="sm">Start 30-day free trial</ButtonLink>
                    <ButtonLink href={`/login?next=${encodeURIComponent(`${basePath}/${material.slug}`)}`} variant="outline" size="sm">Log in</ButtonLink>
                  </div>
                </div>
              ) : (
                <PremiumLock title="Premium material" description={access.trialActive ? "Your trial plan does not include this feature. Upgrade to read and download." : "Your free trial has ended. Upgrade to keep reading premium books and notes."} />
              )
            ) : !user ? (
              <Alert tone="info" title="Log in to read">This {kind} is free. <Link href={`/login?next=${encodeURIComponent(`${basePath}/${material.slug}`)}`} className="font-semibold underline">Log in</Link> or <Link href="/signup" className="font-semibold underline">sign up</Link> to read online and download.</Alert>
            ) : readUrl ? (
              <MaterialReader src={readUrl} itemType={kind} itemId={material.id} pages={material.pages} initialPage={progress?.last_position ?? 1} initialPercent={progress?.progress_percent ?? 0} canSave={Boolean(user)} />
            ) : (
              <Alert tone="warning">The file for this item is not available yet.</Alert>
            )}
          </section>
        </div>

        <aside className="space-y-4">
          <Card>
            <CardContent className="pt-5">
              <p className="flex items-center gap-2 text-sm font-semibold text-ink-900"><ShieldCheck className="h-4 w-4 text-forest-600" aria-hidden="true" />Content licence</p>
              <p className="mt-1 text-sm text-ink-700">{LICENSE_LABELS[material.source_license]}</p>
              <p className="mt-2 text-xs text-ink-500">Added {formatDate(material.created_at)}. Devbhoomi Prep only distributes material it has the right to share.</p>
            </CardContent>
          </Card>
          {!access.subscriptionActive && !access.isAdmin && (
            <Card className="border-saffron-200 bg-saffron-50/60">
              <CardContent className="pt-5">
                <p className="text-sm font-semibold text-ink-900">{access.trialActive ? `Trial · ${access.trialDaysLeft} days left` : "Unlock the full library"}</p>
                <p className="mt-1 text-sm text-ink-700">Premium gives unlimited access to every book, note, paper and mock test.</p>
                <ButtonLink href="/pricing" variant="saffron" size="sm" className="mt-3 w-full">See plans from ₹199</ButtonLink>
              </CardContent>
            </Card>
          )}
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mt-14">
          <SectionHeading title={`More ${subject?.name ?? ""} ${label.toLowerCase()}`} />
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((m) => (
              <MaterialCard key={m.id} material={m} subject={subjectMap.get(m.subject_id)} exams={m.exam_ids.map((id) => examMap.get(id)).filter(Boolean) as NonNullable<ReturnType<typeof examMap.get>>[]} locked={m.is_premium && !hasAccessFeature} bookmarked={relatedSaved.has(m.id)} />
            ))}
          </div>
        </section>
      )}
    </Container>
  );
}

function Meta({ icon: Icon, label, value }: { icon: typeof FileText; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-ink-50 px-3 py-2">
      <dt className="flex items-center gap-1 text-[11px] uppercase tracking-wide text-ink-500"><Icon className="h-3 w-3" aria-hidden="true" />{label}</dt>
      <dd className="mt-0.5 font-semibold text-ink-900">{value}</dd>
    </div>
  );
}
