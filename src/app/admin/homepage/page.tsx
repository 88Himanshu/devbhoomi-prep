import { adminDb } from "@/lib/data";
import { formatDate } from "@/lib/utils";
import { deleteAnnouncement, saveAnnouncement, toggleAnnouncement } from "@/lib/admin/cms";
import { saveFeaturedExams } from "@/lib/admin/exams";
import { saveFeaturedMaterials } from "@/lib/admin/materials";
import { sp1 } from "@/lib/admin/helpers";
import { PageHeader, Table, Td, Th } from "@/components/ui/misc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/form";
import { ActionForm } from "@/components/admin/action-form";
import { ConfirmButton, SubmitButton } from "@/components/admin/confirm-button";
import { Grid2, Toggle } from "@/components/admin/shared";

export const metadata = { title: "Homepage" };

const toLocal = (iso: string | null) => (iso ? new Date(iso).toISOString().slice(0, 16) : "");

export default async function HomepageAdmin(props: PageProps<"/admin/homepage">) {
  const sp = await props.searchParams;
  const editId = sp1(sp.edit);
  const store = await adminDb();
  const [announcements, exams, books, notes] = await Promise.all([
    store.select("announcements", { order: [{ column: "created_at", ascending: false }] }),
    store.select("exams", { order: [{ column: "sort_order" }] }),
    store.select("books", { order: [{ column: "title" }] }),
    store.select("notes", { order: [{ column: "title" }] }),
  ]);
  const editing = announcements.find((a) => a.id === editId) ?? null;

  return (
    <div className="space-y-8">
      <PageHeader title="Homepage" description="Banners, announcements and what is featured on the landing page." />

      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader><CardTitle>Announcements & banners</CardTitle></CardHeader>
          <CardContent className="px-0 pb-0">
            <Table className="min-w-0">
              <thead><tr><Th>Title</Th><Th>Type</Th><Th>Window</Th><Th>Active</Th><Th className="text-right">Actions</Th></tr></thead>
              <tbody>
                {announcements.length === 0 && <tr><Td colSpan={5} className="text-center text-ink-500">None yet.</Td></tr>}
                {announcements.map((a) => (
                  <tr key={a.id} className={a.id === editId ? "bg-brand-50/50" : undefined}>
                    <Td><span className="font-medium text-ink-900">{a.title}</span><span className="line-clamp-1 block text-xs text-ink-500">{a.body}</span></Td>
                    <Td><Badge tone={a.type === "banner" ? "saffron" : "brand"}>{a.type}</Badge></Td>
                    <Td className="text-xs">{a.starts_at || a.ends_at ? `${formatDate(a.starts_at) } → ${formatDate(a.ends_at)}` : "Always"}</Td>
                    <Td><form action={toggleAnnouncement}><input type="hidden" name="id" value={a.id} /><input type="hidden" name="value" value={a.is_active ? "0" : "1"} /><SubmitButton variant="ghost" size="sm" className="h-8 px-2"><Badge tone={a.is_active ? "forest" : "neutral"}>{a.is_active ? "Yes" : "No"}</Badge></SubmitButton></form></Td>
                    <Td className="text-right"><div className="inline-flex gap-1"><ButtonLink href={`/admin/homepage?edit=${a.id}#announcement-form`} variant="outline" size="sm">Edit</ButtonLink><form action={deleteAnnouncement} className="inline"><input type="hidden" name="id" value={a.id} /><ConfirmButton confirmLabel="Delete">Delete</ConfirmButton></form></div></Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </CardContent>
        </Card>
        <Card id="announcement-form" className="h-fit">
          <CardHeader><CardTitle>{editing ? "Edit announcement" : "New announcement"}</CardTitle>{editing && <ButtonLink href="/admin/homepage" variant="ghost" size="sm">New</ButtonLink>}</CardHeader>
          <CardContent>
            <ActionForm key={editing?.id ?? "new"} action={saveAnnouncement} submitLabel={editing ? "Save" : "Create"}>
              {editing && <input type="hidden" name="id" value={editing.id} />}
              <div className="space-y-3">
                <Field label="Type" htmlFor="type"><Select id="type" name="type" defaultValue={editing?.type ?? "announcement"}><option value="announcement">Announcement (notice list)</option><option value="banner">Banner (top of homepage)</option></Select></Field>
                <Field label="Title" htmlFor="title"><Input id="title" name="title" defaultValue={editing?.title} required /></Field>
                <Field label="Body" htmlFor="body"><Textarea id="body" name="body" rows={3} defaultValue={editing?.body} /></Field>
                <Grid2>
                  <Field label="Link URL" htmlFor="link_url"><Input id="link_url" name="link_url" defaultValue={editing?.link_url ?? ""} placeholder="/pricing" /></Field>
                  <Field label="Link label" htmlFor="link_label"><Input id="link_label" name="link_label" defaultValue={editing?.link_label ?? ""} placeholder="See plans" /></Field>
                  <Field label="Starts" htmlFor="starts_at"><Input id="starts_at" name="starts_at" type="datetime-local" defaultValue={toLocal(editing?.starts_at ?? null)} /></Field>
                  <Field label="Ends" htmlFor="ends_at"><Input id="ends_at" name="ends_at" type="datetime-local" defaultValue={toLocal(editing?.ends_at ?? null)} /></Field>
                </Grid2>
                <Toggle name="is_active" label="Active" defaultChecked={editing?.is_active ?? true} />
              </div>
            </ActionForm>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Featured exams</CardTitle></CardHeader>
          <CardContent>
            <form action={saveFeaturedExams} className="space-y-2">
              {exams.map((e) => (
                <div key={e.id} className="flex items-center gap-3 rounded-lg border border-ink-200 px-3 py-2">
                  <label className="flex flex-1 items-center gap-2 text-sm"><Checkbox name={`featured_${e.id}`} defaultChecked={e.is_featured} /> {e.name}</label>
                  <label className="flex items-center gap-1.5 text-xs text-ink-500">Order <Input name={`sort_${e.id}`} type="number" defaultValue={e.sort_order} className="h-8 w-16 text-xs" /></label>
                </div>
              ))}
              <SubmitButton variant="secondary" size="sm">Save featured exams</SubmitButton>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Featured materials</CardTitle></CardHeader>
          <CardContent>
            <form action={saveFeaturedMaterials} className="space-y-4">
              {([["books", books], ["notes", notes]] as const).map(([table, rows]) => (
                <div key={table}>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-500">{table}</p>
                  <div className="max-h-56 space-y-1 overflow-y-auto rounded-lg border border-ink-200 p-2 scrollbar-thin">
                    {rows.map((m) => <label key={m.id} className="flex items-center gap-2 rounded px-2 py-1 text-sm hover:bg-ink-50"><Checkbox name={`featured_${table}_${m.id}`} defaultChecked={m.is_featured} /> <span className="truncate">{m.title}</span>{m.is_premium && <Badge tone="saffron" className="ml-auto">Premium</Badge>}</label>)}
                  </div>
                </div>
              ))}
              <SubmitButton variant="secondary" size="sm">Save featured materials</SubmitButton>
            </form>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
