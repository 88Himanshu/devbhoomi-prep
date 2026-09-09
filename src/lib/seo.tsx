import type { Metadata } from "next";
import { env } from "@/lib/env";

export const SITE_NAME = "Devbhoomi Prep";

/** Build page metadata with canonical + Open Graph defaults. */
export function pageMetadata(opts: { title: string; description: string; path: string; noIndex?: boolean }): Metadata {
  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: opts.path },
    openGraph: {
      title: `${opts.title} | ${SITE_NAME}`,
      description: opts.description,
      url: opts.path,
      type: "website",
    },
    ...(opts.noIndex ? { robots: { index: false, follow: false } } : {}),
  };
}

export const absoluteUrl = (path: string) => new URL(path, env.APP_URL).toString();

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: env.APP_URL,
    logo: absoluteUrl("/opengraph-image"),
    email: "support@devbhoomiprep.in",
    address: { "@type": "PostalAddress", addressLocality: "Dehradun", addressRegion: "Uttarakhand", addressCountry: "IN" },
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: env.APP_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: absoluteUrl("/search?q={search_term_string}") },
      "query-input": "required name=search_term_string",
    },
  };
}

export function courseJsonLd(opts: { name: string; description: string; path: string; provider?: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: opts.name,
    description: opts.description,
    url: absoluteUrl(opts.path),
    provider: { "@type": "Organization", name: SITE_NAME, sameAs: env.APP_URL },
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "INR", description: "30-day free trial" },
  };
}

export function faqJsonLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({ "@type": "Question", name: it.q, acceptedAnswer: { "@type": "Answer", text: it.a } })),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: absoluteUrl(it.path) })),
  };
}

/** Render one or more JSON-LD objects. */
export function JsonLd({ data }: { data: object | object[] }) {
  const list = Array.isArray(data) ? data : [data];
  return (
    <>
      {list.map((d, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(d).replace(/</g, "\\u003c") }} />
      ))}
    </>
  );
}
