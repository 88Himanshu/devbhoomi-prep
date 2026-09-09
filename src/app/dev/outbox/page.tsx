import { notFound } from "next/navigation";
import { isDemoMode } from "@/lib/env";
import { readOutbox } from "@/lib/auth/mailer";
import { Container, EmptyState, PageHeader } from "@/components/ui/misc";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import { Inbox } from "lucide-react";

export const metadata = { title: "Demo mail outbox", robots: { index: false } };

export default function OutboxPage() {
  if (!isDemoMode() || process.env.NODE_ENV === "production") notFound();
  const mails = readOutbox();
  return (
    <main className="flex-1 bg-ink-50">
      <Container className="max-w-3xl py-10">
        <PageHeader eyebrow="Demo mode" title="Mail outbox" description="In demo mode, verification and password-reset emails land here instead of being sent." />
        <div className="mt-6 grid gap-3">
          {mails.length === 0 && <EmptyState icon={Inbox} title="No emails yet" description="Sign up or request a password reset to see messages." />}
          {mails.map((m) => (
            <Card key={m.id}>
              <CardContent className="pt-5">
                <p className="text-xs text-ink-500">{formatDateTime(m.sent_at)} · to {m.to}</p>
                <p className="mt-1 font-semibold">{m.subject}</p>
                <p className="mt-1 text-sm text-ink-700">{m.body}</p>
                {m.link && <a href={m.link} className="mt-2 inline-block break-all text-sm font-medium text-brand-700 underline">{m.link}</a>}
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>
    </main>
  );
}
