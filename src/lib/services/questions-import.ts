import "server-only";
import { adminDb } from "@/lib/data";
import type { Difficulty, Exam, Language, OptionKey, Question, Subject } from "@/lib/types";
import type { Insert as DbInsert } from "@/lib/data";

/**
 * CSV bulk import for the question bank.
 * Columns (header row required, order free, case-insensitive):
 *   question, option_a, option_b, option_c, option_d, correct_answer, explanation,
 *   subject, exam, year, difficulty, marks, negative_marks, language
 * subject/exam accept id, slug or name. Excel users: File → Save As → CSV UTF-8.
 */

export const IMPORT_COLUMNS = [
  "question", "option_a", "option_b", "option_c", "option_d", "correct_answer", "explanation",
  "subject", "exam", "year", "difficulty", "marks", "negative_marks", "language",
] as const;

export const TEMPLATE_CSV =
  IMPORT_COLUMNS.join(",") + "\r\n" +
  '"Which river is known as the Alaknanda\'s major tributary meeting it at Devprayag?","Bhagirathi","Mandakini","Pindar","Nandakini","A","Bhagirathi meets Alaknanda at Devprayag to form the Ganga.","uttarakhand-gk","uksssc","2021","easy","1","0.25","en"\r\n' +
  '"वर्ष 2000 में उत्तराखंड का गठन किस राज्य से हुआ?","बिहार","उत्तर प्रदेश","हिमाचल प्रदेश","मध्य प्रदेश","B","9 नवम्बर 2000 को उत्तर प्रदेश से पृथक होकर उत्तराखंड बना।","uttarakhand-gk","police","","easy","1","0.25","hi"\r\n';

/** RFC-4180-ish parser: quoted fields, doubled quotes, CRLF, BOM. */
export function parseCsv(text: string): string[][] {
  const src = text.replace(/^﻿/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let i = 0;
  let quoted = false;
  while (i < src.length) {
    const c = src[i];
    if (quoted) {
      if (c === '"') {
        if (src[i + 1] === '"') { field += '"'; i += 2; continue; }
        quoted = false; i++; continue;
      }
      field += c; i++; continue;
    }
    if (c === '"') { quoted = true; i++; continue; }
    if (c === ",") { row.push(field); field = ""; i++; continue; }
    if (c === "\r") { i++; continue; }
    if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; i++; continue; }
    field += c; i++;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((f) => f.trim() !== ""));
}

export interface ImportRow {
  line: number;
  errors: string[];
  question: DbInsert<"questions"> | null;
  preview: { text: string; subject: string; exam: string; correct: string };
}

export interface ImportPreview {
  headers: string[];
  missingColumns: string[];
  rows: ImportRow[];
  validCount: number;
  errorCount: number;
}

const normalize = (s: string) => s.trim().toLowerCase().replace(/[\s-]+/g, "_");

function lookup<T extends { id: string; slug: string; name: string }>(items: T[], value: string): T | null {
  const v = value.trim().toLowerCase();
  if (!v) return null;
  return items.find((i) => i.id.toLowerCase() === v || i.slug.toLowerCase() === v || i.name.toLowerCase() === v || i.id.toLowerCase() === `sub_${v}` || i.id.toLowerCase() === `exam_${v}`) ?? null;
}

export function validateRows(
  csv: string[][],
  subjects: Subject[],
  exams: Exam[],
  defaults: { subject_id?: string | null; exam_id?: string | null; year?: number | null } = {},
): ImportPreview {
  if (!csv.length) return { headers: [], missingColumns: [...IMPORT_COLUMNS], rows: [], validCount: 0, errorCount: 0 };
  const headers = csv[0].map(normalize);
  const required = ["question", "option_a", "option_b", "option_c", "option_d", "correct_answer"];
  const missingColumns = required.filter((c) => !headers.includes(c));
  const idx = (name: string) => headers.indexOf(name);
  const rows: ImportRow[] = [];
  if (missingColumns.length) return { headers, missingColumns, rows, validCount: 0, errorCount: 0 };

  for (let r = 1; r < csv.length; r++) {
    const cells = csv[r];
    const get = (name: string) => (idx(name) >= 0 ? (cells[idx(name)] ?? "").trim() : "");
    const errors: string[] = [];
    const text = get("question");
    const opts = ["option_a", "option_b", "option_c", "option_d"].map(get);
    if (!text) errors.push("question is empty");
    opts.forEach((o, i) => { if (!o) errors.push(`option_${"abcd"[i]} is empty`); });
    let correct = get("correct_answer").toUpperCase();
    if (/^[1-4]$/.test(correct)) correct = "ABCD"[Number(correct) - 1];
    if (!["A", "B", "C", "D"].includes(correct)) errors.push("correct_answer must be A, B, C or D");

    const subject = get("subject") ? lookup(subjects, get("subject")) : defaults.subject_id ? subjects.find((s) => s.id === defaults.subject_id) ?? null : null;
    if (!subject) errors.push(get("subject") ? `unknown subject "${get("subject")}"` : "subject is required");
    const examRaw = get("exam");
    const exam = examRaw ? lookup(exams, examRaw) : defaults.exam_id ? exams.find((e) => e.id === defaults.exam_id) ?? null : null;
    if (examRaw && !exam) errors.push(`unknown exam "${examRaw}"`);

    const yearRaw = get("year");
    const year = yearRaw ? Number(yearRaw) : defaults.year ?? null;
    if (yearRaw && (!Number.isInteger(year) || (year as number) < 1990 || (year as number) > 2100)) errors.push("year must be between 1990 and 2100");

    const diffRaw = (get("difficulty") || "medium").toLowerCase();
    if (!["easy", "medium", "hard"].includes(diffRaw)) errors.push("difficulty must be easy, medium or hard");
    const marks = get("marks") ? Number(get("marks")) : 1;
    const negative = get("negative_marks") ? Number(get("negative_marks")) : 0.25;
    if (!Number.isFinite(marks) || marks <= 0) errors.push("marks must be a positive number");
    if (!Number.isFinite(negative) || negative < 0) errors.push("negative_marks must be 0 or more");
    const langRaw = (get("language") || "en").toLowerCase();
    const language = (["en", "hi", "bilingual"].includes(langRaw) ? langRaw : langRaw === "hindi" ? "hi" : langRaw === "english" ? "en" : null) as Language | null;
    if (!language) errors.push("language must be en, hi or bilingual");

    rows.push({
      line: r + 1,
      errors,
      preview: { text: text.slice(0, 120), subject: subject?.name ?? get("subject"), exam: exam?.short_name ?? examRaw, correct },
      question: errors.length
        ? null
        : {
            text,
            option_a: opts[0], option_b: opts[1], option_c: opts[2], option_d: opts[3],
            correct_option: correct as OptionKey,
            explanation: get("explanation"),
            subject_id: subject!.id,
            exam_id: exam?.id ?? null,
            year: year ?? null,
            difficulty: diffRaw as Difficulty,
            marks,
            negative_marks: negative,
            language: language!,
            is_active: true,
          },
    });
  }
  const errorCount = rows.filter((r) => r.errors.length).length;
  return { headers, missingColumns, rows, validCount: rows.length - errorCount, errorCount };
}

export async function commitImport(rows: DbInsert<"questions">[]): Promise<Question[]> {
  if (!rows.length) return [];
  const store = await adminDb();
  const out: Question[] = [];
  // Insert in chunks to keep PostgREST payloads reasonable.
  for (let i = 0; i < rows.length; i += 200) out.push(...(await store.insertMany("questions", rows.slice(i, i + 200) )));
  return out;
}
