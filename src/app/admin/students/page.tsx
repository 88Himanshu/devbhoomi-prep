import Link from "next/link";
import { Ban, CheckCircle2 } from "lucide-react";
import { loadStudents, daysLeft } from "@/lib/admin/queries";
import { setBlocked } from "@/lib/admin/students";
import { pageParams, sp1 } from "@/lib/admin/helpers";
import { formatDate } from "@/lib/utils";
import { PageHeader, Table, Td, Th, EmptyState } from "@/components/ui/misc";
import { Badge } from "@/components/ui/badge";
import { FilterBar, FilterInput, FilterSelect, Pagination } from "@/components/admin/shared";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { Users } from "lucide-react";

export const metadata = { title: "Students" };

export default async function StudentsPage(props: PageProps<"/admin/students">) {
  const sp = await props.searchParams;
  const q = sp1(sp.q).toLowerCase();
  const filter = sp1(sp.filter);
  const { page, pageSize, offset } = pageParams(sp);
  let rows = (await loadStudents()).filter((r) => r.user.role === "student");
  if (q) rows = rows.filter((r) => [r.user.full_name, r.user.email, r.user.mobile ?? ""].some((v) => v.toLowerCase().includes(q)));
  if (filter === "blocked") rows = rows.filter((r) => r.user.is_blocked);
  if (filter === "trial") rows = rows.filter((r) => r.trialActive && !r.subscription);
  if (filter === "subscribed") rows = rows.filter((r) => r.subscription);
  if (filter === "expired") rows = rows.filter((r) => !r.trialActive && !r.subscription);
  const total = rows.length;
  const pageRows = rows.slice(offset, offset + pageSize);

  return (
    <div>
      <PageHeader title="Students" description={`${total} matching students`} className="mb-5" />
      <FilterBar reset="/admin/students">
        <FilterInput name="q" placeholder="Search name, email, mobile" defaultValue={sp1(sp.q)} className="w-64" />
        <FilterSelect name="filter" defaultValue={filter} options={[{ value: "trial", label: "Trial active" }, { value: "subscribed", label: "Subscribed" }, { value: "expired", label: "Trial expired, no plan" }, { value: "blocked", label: "Blocked" }]} allLabel="All students" />
      </FilterBar>
      {pageRows.length === 0 ? (
        <EmptyState icon={Users} title="No students match" />
      ) : (
        <Table>
          <thead><tr><Th>Student</Th><Th>Mobile</Th><Th>Joined</Th><Th>Trial</Th><Th>Subscription</Th><Th>Tests</Th><Th>Status</Th><Th className="text-right">Actions</Th></tr></thead>
          <tbody>
            {pageRows.map(({ user, profile, subscription, attempts, trialActive }) => (
              <tr key={user.id} className="hover:bg-ink-50/60">
                <Td><Link href={`/admin/students/${user.id}`} className="font-medium text-ink-900 hover:text-brand-700">{user.full_name}</Link><span className="block text-xs text-ink-500">{user.email}</span></Td>
                <Td>{user.mobile ?? "—"}</Td>
                <Td>{formatDate(user.created_at)}</Td>
                <Td>{profile ? (trialActive ? <Badge tone="saffron">{daysLeft(profile.trial_ends_at)}d left</Badge> : <span className="text-xs text-ink-500">Ended {formatDate(profile.trial_ends_at)}</span>) : "—"}</Td>
                <Td>{subscription ? <Badge tone="forest" className="capitalize">{subscription.plan_id} · {daysLeft(subscription.ends_at)}d</Badge> : <span className="text-xs text-ink-500">None</span>}</Td>
                <Td>{attempts}</Td>
                <Td>{user.is_blocked ? <Badge tone="red">Blocked</Badge> : <Badge tone="forest">Active</Badge>}</Td>
                <Td className="text-right">
                  <form action={setBlocked} className="inline">
                    <input type="hidden" name="user_id" value={user.id} />
                    <input type="hidden" name="blocked" value={user.is_blocked ? "0" : "1"} />
                    <input type="hidden" name="return" value="/admin/students" />
                    <ConfirmButton variant={user.is_blocked ? "outline" : "danger"} confirmLabel={user.is_blocked ? "Unblock" : "Block"}>
                      {user.is_blocked ? <><CheckCircle2 className="h-4 w-4" aria-hidden="true" /> Unblock</> : <><Ban className="h-4 w-4" aria-hidden="true" /> Block</>}
                    </ConfirmButton>
                  </form>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      <Pagination page={page} pageSize={pageSize} total={total} basePath="/admin/students" params={{ q: sp1(sp.q), filter }} />
    </div>
  );
}
