"use client";

import { useActionState } from "react";
import { Download } from "lucide-react";
import type { Exam, Subject } from "@/lib/types";

import { commitQuestionImport, previewQuestionImport } from "@/lib/admin/questions";
import { FileField } from "@/components/admin/file-field";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/form";
import { Alert, Table, Td, Th } from "@/components/ui/misc";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ImportWizard({ subjects, exams }: { subjects: Subject[]; exams: Exam[] }) {
  const [preview, previewAction, previewing] = useActionState(previewQuestionImport, null);
  const [commit, commitAction, committing] = useActionState(commitQuestionImport, null);
  const p = preview?.preview;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>1. Upload CSV</CardTitle>
          <a href="/api/admin/questions/template.csv" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700"><Download className="h-4 w-4" aria-hidden="true" /> Download template</a>
        </CardHeader>
        <CardContent>
          <form action={previewAction} className="space-y-4">
            {preview?.error && <Alert tone="error">{preview.error}</Alert>}
            {preview?.fieldErrors?.csv_key && <Alert tone="error">{preview.fieldErrors.csv_key}</Alert>}
            <FileField name="csv_key" label="CSV file" folder="misc" accept=".csv,text/csv" hint="Columns: question, option_a–d, correct_answer, explanation, subject, exam, year, difficulty, marks, negative_marks, language. Excel: File → Save As → CSV UTF-8." />
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Default subject" htmlFor="default_subject_id" hint="Used when a row leaves subject blank"><Select id="default_subject_id" name="default_subject_id" defaultValue=""><option value="">None</option>{subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</Select></Field>
              <Field label="Default exam" htmlFor="default_exam_id"><Select id="default_exam_id" name="default_exam_id" defaultValue=""><option value="">None</option>{exams.map((e) => <option key={e.id} value={e.id}>{e.short_name}</option>)}</Select></Field>
              <Field label="Default year" htmlFor="default_year"><Input id="default_year" name="default_year" type="number" placeholder="e.g. 2023" /></Field>
            </div>
            <Button type="submit" loading={previewing} variant="secondary">Validate (dry run)</Button>
          </form>
        </CardContent>
      </Card>

      {p && preview?.csvKey && (
        <Card>
          <CardHeader>
            <CardTitle>2. Review</CardTitle>
            <div className="flex gap-2"><Badge tone="forest">{p.validCount} valid</Badge>{p.errorCount > 0 && <Badge tone="red">{p.errorCount} with errors</Badge>}</div>
          </CardHeader>
          <CardContent className="space-y-4">
            {p.missingColumns.length > 0 && <Alert tone="error">Missing columns: {p.missingColumns.join(", ")}</Alert>}
            {p.rows.length > 0 && (
              <div className="max-h-96 overflow-auto rounded-xl border border-ink-200 scrollbar-thin">
                <Table className="border-0">
                  <thead><tr><Th>Line</Th><Th>Question</Th><Th>Subject</Th><Th>Exam</Th><Th>Ans</Th><Th>Result</Th></tr></thead>
                  <tbody>
                    {p.rows.slice(0, 300).map((r) => (
                      <tr key={r.line} className={r.errors.length ? "bg-red-50/60" : undefined}>
                        <Td>{r.line}</Td>
                        <Td className="max-w-md"><span className="line-clamp-2">{r.preview.text}</span></Td>
                        <Td>{r.preview.subject}</Td>
                        <Td>{r.preview.exam || "—"}</Td>
                        <Td>{r.preview.correct}</Td>
                        <Td>{r.errors.length ? <span className="text-xs text-red-700">{r.errors.join("; ")}</span> : <Badge tone="forest">OK</Badge>}</Td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                {p.rows.length > 300 && <p className="p-3 text-xs text-ink-500">Showing first 300 of {p.rows.length} rows.</p>}
              </div>
            )}
            <form action={commitAction} className="flex flex-wrap items-center gap-3">
              <input type="hidden" name="csv_key" value={preview.csvKey} />
              <input type="hidden" name="default_subject_id" value={p.rows.length ? "" : ""} />
              {commit?.error && <Alert tone="error" className="w-full">{commit.error}</Alert>}
              <Button type="submit" loading={committing} disabled={p.validCount === 0} variant="forest">Import {p.validCount} valid question{p.validCount === 1 ? "" : "s"}</Button>
              {p.errorCount > 0 && <span className="text-sm text-ink-500">Rows with errors will be skipped.</span>}
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
