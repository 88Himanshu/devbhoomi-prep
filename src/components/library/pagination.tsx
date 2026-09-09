import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Pagination({ page, pageSize, total, basePath, params }: { page: number; pageSize: number; total: number; basePath: string; params: Record<string, string | undefined> }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return null;
  const href = (p: number) => {
    const sp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v) sp.set(k, v); });
    if (p > 1) sp.set("page", String(p)); else sp.delete("page");
    return `${basePath}${sp.toString() ? `?${sp}` : ""}`;
  };
  const items = Array.from({ length: pages }, (_, i) => i + 1).filter((p) => p === 1 || p === pages || Math.abs(p - page) <= 1);
  return (
    <nav className="mt-8 flex items-center justify-center gap-1" aria-label="Pagination">
      <PageLink href={href(page - 1)} disabled={page <= 1} aria-label="Previous page"><ChevronLeft className="h-4 w-4" /></PageLink>
      {items.map((p, i) => (
        <span key={p} className="flex items-center gap-1">
          {i > 0 && items[i - 1] !== p - 1 && <span className="px-1 text-ink-500">…</span>}
          <PageLink href={href(p)} active={p === page} aria-current={p === page ? "page" : undefined}>{p}</PageLink>
        </span>
      ))}
      <PageLink href={href(page + 1)} disabled={page >= pages} aria-label="Next page"><ChevronRight className="h-4 w-4" /></PageLink>
    </nav>
  );
}

function PageLink({ href, disabled, active, children, ...rest }: { href: string; disabled?: boolean; active?: boolean; children: React.ReactNode; "aria-label"?: string; "aria-current"?: "page" }) {
  const cls = cn("inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-medium", active ? "bg-brand-700 text-white" : "text-ink-700 hover:bg-ink-100", disabled && "pointer-events-none opacity-40");
  if (disabled) return <span className={cls} aria-disabled="true">{children}</span>;
  return <Link href={href} className={cls} {...rest}>{children}</Link>;
}
