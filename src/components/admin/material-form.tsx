import type { Exam, Material, Subject } from "@/lib/types";
import { saveMaterial } from "@/lib/admin/materials";
import { ActionForm } from "@/components/admin/action-form";
import { FileField } from "@/components/admin/file-field";
import { FormShell, Grid2, Toggle } from "@/components/admin/shared";
import { Checkbox, Field, Input, Label, Select, Textarea } from "@/components/ui/form";
import { ButtonLink } from "@/components/ui/button";
import { Alert } from "@/components/ui/misc";

const COLORS = ["#163e86", "#1e4fa3", "#0f2f6b", "#1b7f4f", "#166a42", "#23905c", "#b07200"];

export function MaterialForm({ kind, material, subjects, exams }: { kind: "book" | "note"; material?: Material | null; subjects: Subject[]; exams: Exam[] }) {
  const back = `/admin/${kind}s`;
  const label = kind === "book" ? "book" : "note";
  return (
    <FormShell
      title={material ? `Edit ${material.title}` : `New ${label}`}
      description={`Published ${label}s appear in the library at /${kind}s. Premium items show a lock for students without access.`}
      aside={<Alert tone="warning" title="Content rights">Only upload original notes, admin-created material, licensed content, public-domain or otherwise authorised PDFs. Do not upload copyrighted commercial books without permission.</Alert>}
    >
      <ActionForm action={saveMaterial} submitLabel={material ? "Save changes" : `Create ${label}`} secondary={<ButtonLink href={back} variant="ghost">Cancel</ButtonLink>}>
        <input type="hidden" name="kind" value={kind} />
        {material && <input type="hidden" name="id" value={material.id} />}
        <div className="space-y-4">
          <Field label="Title" htmlFor="title"><Input id="title" name="title" defaultValue={material?.title} required /></Field>
          <Grid2>
            <Field label="Slug" htmlFor="slug" hint="Blank = generated from title"><Input id="slug" name="slug" defaultValue={material?.slug} /></Field>
            <Field label="Author / source" htmlFor="author"><Input id="author" name="author" defaultValue={material?.author ?? "Devbhoomi Prep Editorial Team"} /></Field>
            <Field label="Subject" htmlFor="subject_id"><Select id="subject_id" name="subject_id" defaultValue={material?.subject_id ?? ""}><option value="">Select…</option>{subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</Select></Field>
            <Field label="Language" htmlFor="language"><Select id="language" name="language" defaultValue={material?.language ?? "en"}><option value="en">English</option><option value="hi">Hindi</option><option value="bilingual">Bilingual</option></Select></Field>
            <Field label="Year" htmlFor="year"><Input id="year" name="year" type="number" defaultValue={material?.year ?? new Date().getFullYear()} /></Field>
            <Field label="Pages" htmlFor="pages"><Input id="pages" name="pages" type="number" defaultValue={material?.pages ?? 0} /></Field>
            <Field label="Source licence" htmlFor="source_license"><Select id="source_license" name="source_license" defaultValue={material?.source_license ?? "original"}><option value="original">Original (created by us)</option><option value="licensed">Licensed</option><option value="public_domain">Public domain</option><option value="authorized">Authorised by rights holder</option></Select></Field>
            <div>
              <Label>Cover colour</Label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((c, i) => (
                  <label key={c} className="cursor-pointer">
                    <input type="radio" name="cover_color" value={c} defaultChecked={material ? material.cover_color === c : i === 0} className="peer sr-only" />
                    <span className="block h-8 w-8 rounded-lg ring-2 ring-transparent ring-offset-2 peer-checked:ring-brand-500" style={{ background: c }} />
                  </label>
                ))}
              </div>
            </div>
          </Grid2>
          <Field label="Description" htmlFor="description"><Textarea id="description" name="description" rows={4} defaultValue={material?.description} /></Field>
          <div>
            <Label>Exams</Label>
            <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
              {exams.map((e) => (
                <label key={e.id} className="flex items-center gap-2 rounded-lg border border-ink-200 px-3 py-2 text-sm hover:bg-ink-50">
                  <Checkbox name="exam_ids" value={e.id} defaultChecked={material?.exam_ids.includes(e.id)} /> {e.short_name}
                </label>
              ))}
            </div>
          </div>
          <Grid2>
            <FileField name="file_path" label="PDF file" folder={kind === "book" ? "books" : "notes"} initialKey={material?.file_path} hint="PDF up to 25 MB. Served through /api/files with access checks." />
            <FileField name="preview_path" label="Preview PDF (optional)" folder={kind === "book" ? "books" : "notes"} initialKey={material?.preview_path} hint="First few pages, shown to everyone." />
          </Grid2>
          <div className="grid gap-2 sm:grid-cols-3">
            <Toggle name="is_premium" label="Premium" hint="Locked without trial/subscription" defaultChecked={material?.is_premium ?? true} />
            <Toggle name="is_published" label="Published" defaultChecked={material?.is_published ?? true} />
            <Toggle name="is_featured" label="Featured on homepage" defaultChecked={material?.is_featured ?? false} />
          </div>
          {!material && <Toggle name="rights_ack" label="I confirm the platform has the right to distribute this file" />}
        </div>
      </ActionForm>
    </FormShell>
  );
}
