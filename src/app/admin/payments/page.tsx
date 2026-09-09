import Link from "next/link";
import { adminDb } from "@/lib/data";
import { formatINR } from "@/lib/plans";
import { formatDateTime } from "@/lib/utils";
import { userMap } from "@/lib/admin/queries";
import { markRefund } from "@/lib/admin/billing";
import { pageParams, sp1 } from "@/lib/admin/helpers";
import { PageHeader, Stat, Table, Td, Th, Alert } from "@/components/ui/misc";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/form";
import { SubmitButton } from "@/components/admin/confirm-button";
import { FilterBar, FilterInput, FilterSelect, Pagination } from "@/components/admin/shared";

export const metadata = { title: "Payments" };

export default async function PaymentsAdmin(props: PageProps<"/admin/payments">) {
  const sp = await props.searchParams;
  const status = sp1(sp.status), q = sp1(sp.q).toLowerCase();
  const store = await adminDb();
  const [all, users] = await Promise.all([store.select("payments", { order: [{ column: "created_at", ascending: false }] }), userMap()]);
  let rows = status ? all.filter((p) => p.status === status) : all;
  if (q) rows = rows.filter((p) => { const u = users.get(p.user_id); return [u?.full_name, u?.email, p.razorpay_order_id, p.razorpay_payment_id, p.invoice_number, p.receipt].some((v) => v?.toLowerCase().includes(q)); });
  const { page, pageSize, offset } = pageParams(sp);
  const pageRows = rows.slice(offset, offset + pageSize);
  const sum = (s: string) => all.filter((p) => p.status === s).reduce((a, p) => a + p.amount, 0) / 100;
  const tone = (s: string) => (s === "paid" ? "forest" : s === "failed" ? "red" : s === "refunded" ? "saffron" : "neutral") as "forest" | "red" | "saffron" | "neutral";

  return (
    <div className="space-y-6">
      <PageHeader title="Payments" description="Razorpay transactions. Payment status is only set by the verified server flow and webhook." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Successful" value={formatINR(sum("paid"))} hint={`${all.filter((p) => p.status === "paid").length} payments`} tone="forest" />
        <Stat label="Failed" value={all.filter((p) => p.status === "failed").length} tone="neutral" />
        <Stat label="Refunded" value={formatINR(sum("refunded"))} tone="saffron" />
        <Stat label="Pending (created)" value={all.filter((p) => p.status === "created").length} tone="neutral" />
      </div>
      <FilterBar reset="/admin/payments">
        <FilterInput name="q" placeholder="Student, order id, invoice" defaultValue={sp1(sp.q)} className="w-64" />
        <FilterSelect name="status" defaultValue={status} options={["paid", "failed", "refunded", "created"].map((s) => ({ value: s, label: s[0].toUpperCase() + s.slice(1) }))} allLabel="All statuses" className="w-40" />
      </FilterBar>
      <Table>
        <thead><tr><Th>Date</Th><Th>Student</Th><Th>Plan</Th><Th>Amount</Th><Th>Method</Th><Th>Razorpay ids</Th><Th>Status</Th><Th>Invoice</Th><Th>Refund</Th></tr></thead>
        <tbody>
          {pageRows.length === 0 && <tr><Td colSpan={9} className="text-center text-ink-500">No payments match.</Td></tr>}
          {pageRows.map((p) => {
            const u = users.get(p.user_id);
            return (
              <tr key={p.id}>
                <Td className="whitespace-nowrap text-xs">{formatDateTime(p.paid_at ?? p.created_at)}</Td>
                <Td>{u ? <Link href={`/admin/students/${u.id}`} className="font-medium text-ink-900 hover:text-brand-700">{u.full_name}</Link> : p.user_id}<span className="block text-xs text-ink-500">{u?.email}</span></Td>
                <Td className="capitalize">{p.plan_id}</Td>
                <Td className="font-medium text-ink-900">{formatINR(p.amount / 100)}</Td>
                <Td>{p.method ?? "—"}</Td>
                <Td className="font-mono text-[11px]">{p.razorpay_order_id ?? "—"}<span className="block">{p.razorpay_payment_id ?? ""}</span></Td>
                <Td><Badge tone={tone(p.status)}>{p.status}</Badge>{p.failure_reason && <span className="block max-w-40 text-xs text-red-700">{p.failure_reason}</span>}</Td>
                <Td className="text-xs">{p.invoice_number ?? "—"}<span className="block text-ink-500">{p.receipt}</span></Td>
                <Td>
                  {p.status === "paid" || p.status === "refunded" ? (
                    <form action={markRefund} className="flex items-center gap-1">
                      <input type="hidden" name="id" value={p.id} />
                      <Input name="refund_status" defaultValue={p.refund_status ?? ""} placeholder="e.g. refunded" className="h-8 w-32 text-xs" />
                      <SubmitButton variant="outline" size="sm" className="h-8">Save</SubmitButton>
                    </form>
                  ) : "—"}
                </Td>
              </tr>
            );
          })}
        </tbody>
      </Table>
      <Pagination page={page} pageSize={pageSize} total={rows.length} basePath="/admin/payments" params={{ q: sp1(sp.q), status }} />
      <Alert tone="info">Refunds are issued from the Razorpay dashboard. Recording a refund status containing “refunded” here marks the payment refunded and cancels its linked subscription.</Alert>
    </div>
  );
}
