import type { Metadata } from "next";
import Link from "next/link";
import { ClipboardList, Play } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { getExamMap } from "@/lib/services/catalog";
import { countUserAttempts, getUserAttempts, isExpired } from "@/lib/services/tests";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Alert, EmptyState, PageHeader, Table, Td, Th } from "@/components/ui/misc";
import { formatDateTime, formatDuration } from "@/lib/utils";

export const metadata: Metadata = { title: "Test history", robots: { index: false } };

const PAGE_SIZE = 15;

export default async function HistoryPage(props: PageProps<"/tests/history">) {
  const sp = await props.searchParams;
  const user = await requireUser("/tests/history");
  const page = Math.max(1, Number(Array.isArray(sp.page) ? sp.page[0] : sp.page) || 1);
  const [attempts, total, examMap] = await Promise.all([
    getUserAttempts(user.id, { limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE }),
    countUserAttempts(user.id),
    getExamMap(),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <PageHeader eyebrow="My learning" title="Test history" description="Every mock and custom test you have attempted, newest first." actions={<ButtonLink href="/mock-tests"><ClipboardList className="h-4 w-4" aria-hidden="true" /> Browse tests</ButtonLink>} />
      {sp.error === "forbidden" && <Alert tone="error" className="mt-4">That attempt belongs to another account.</Alert>}
      {attempts.length === 0 ? (
        <EmptyState className="mt-6" icon={ClipboardList} title="No attempts yet" description="Start with a free mock test and your results will appear here." action={<ButtonLink href="/mock-tests" size="sm">Browse mock tests</ButtonLink>} />
      ) : (
        <div className="mt-6">
          <Table>
            <thead>
              <tr><Th>Test</Th><Th>Exam</Th><Th>Date</Th><Th className="text-right">Score</Th><Th className="text-right">%</Th><Th className="text-right">Accuracy</Th><Th className="text-right">Time</Th><Th>Status</Th><Th /></tr>
            </thead>
            <tbody>
              {attempts.map((a) => {
                const live = a.status === "in_progress" && !isExpired(a);
                return (
                  <tr key={a.id}>
                    <Td className="max-w-xs font-medium text-ink-900"><span className="line-clamp-2">{a.title}</span>{!a.mock_test_id && <Badge className="ml-1.5">Custom</Badge>}</Td>
                    <Td>{examMap.get(a.exam_id)?.short_name ?? "—"}</Td>
                    <Td className="whitespace-nowrap">{formatDateTime(a.submitted_at ?? a.started_at)}</Td>
                    <Td className="text-right">{a.status === "submitted" ? `${a.score} / ${a.total_marks}` : "—"}</Td>
                    <Td className="text-right">{a.status === "submitted" ? `${a.percentage}%` : "—"}</Td>
                    <Td className="text-right">{a.status === "submitted" ? `${a.accuracy}%` : "—"}</Td>
                    <Td className="text-right">{a.status === "submitted" ? formatDuration(a.time_taken_seconds) : "—"}</Td>
                    <Td>{a.status === "submitted" ? <Badge tone="forest">Submitted</Badge> : live ? <Badge tone="saffron">In progress</Badge> : <Badge>Timed out</Badge>}</Td>
                    <Td className="text-right whitespace-nowrap">
                      {live ? (
                        <Link href={`/tests/attempt/${a.id}`} className="inline-flex items-center gap-1 font-medium text-brand-700 hover:underline"><Play className="h-3.5 w-3.5" aria-hidden="true" /> Resume</Link>
                      ) : (
                        <Link href={`/tests/result/${a.id}`} className="font-medium text-brand-700 hover:underline">Review</Link>
                      )}
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
          {pages > 1 && (
            <nav className="mt-4 flex items-center justify-between text-sm" aria-label="Pagination">
              <span className="text-ink-500">Page {page} of {pages} · {total} attempts</span>
              <div className="flex gap-2">
                {page > 1 && <ButtonLink href={`/tests/history?page=${page - 1}`} variant="outline" size="sm">Previous</ButtonLink>}
                {page < pages && <ButtonLink href={`/tests/history?page=${page + 1}`} variant="outline" size="sm">Next</ButtonLink>}
              </div>
            </nav>
          )}
        </div>
      )}
    </div>
  );
}
