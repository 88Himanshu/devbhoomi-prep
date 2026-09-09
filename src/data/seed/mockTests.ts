import type { Difficulty, MockTest, MockTestQuestion, Question } from "@/lib/types";
import { questions } from "./questions";
import { daysAgo } from "./constants";

/**
 * Deterministic question picker: takes the first `n` questions matching the
 * filter, offset so different tests overlap less. Never exceeds availability.
 */
function pick(filter: (q: Question) => boolean, n: number, offset = 0): string[] {
  const pool = questions.filter(filter).map((q) => q.id);
  if (pool.length === 0) return [];
  const out: string[] = [];
  for (let i = 0; i < Math.min(n, pool.length); i++) out.push(pool[(offset + i) % pool.length]);
  return out;
}

const bySubject = (s: string, n: number, offset = 0) => pick((q) => q.subject_id === s, n, offset);

/** Full-length mix: proportional slices from several subjects. */
function mix(parts: [subject: string, n: number, offset?: number][]): string[] {
  const ids: string[] = [];
  for (const [s, n, o] of parts) for (const id of bySubject(s, n, o ?? 0)) if (!ids.includes(id)) ids.push(id);
  return ids;
}

interface Spec {
  slug: string;
  title: string;
  description: string;
  exam_id: string;
  subject_id: string | null;
  difficulty: Difficulty;
  is_premium: boolean;
  is_pyp: boolean;
  attempts: number;
  ids: string[];
}

const specs: Spec[] = [
  { slug: "ukpsc-prelims-gs-full-mock-1", title: "UKPSC Prelims GS Full Mock 1", description: "Full-length General Studies paper mirroring the UKPSC Upper PCS Prelims mix of Uttarakhand GK, polity, history, geography and current affairs.", exam_id: "exam_ukpsc", subject_id: null, difficulty: "hard", is_premium: false, is_pyp: false, attempts: 640, ids: mix([["sub_uk_gk", 14, 0], ["sub_gs", 12, 0], ["sub_current", 8, 0], ["sub_env", 4, 0]]) },
  { slug: "ukpsc-uttarakhand-gk-sectional-1", title: "UKPSC Uttarakhand GK Sectional 1", description: "Sectional test on Uttarakhand history, geography and culture at prelims difficulty.", exam_id: "exam_ukpsc", subject_id: "sub_uk_gk", difficulty: "medium", is_premium: true, is_pyp: false, attempts: 410, ids: bySubject("sub_uk_gk", 30, 14) },
  { slug: "ukpsc-upper-pcs-2021-prelims-pyp", title: "UKPSC Upper PCS 2021 – Previous Year Paper (Selected Questions)", description: "Selected questions on the pattern of the 2021 UKPSC Prelims GS paper, arranged as a timed mock.", exam_id: "exam_ukpsc", subject_id: null, difficulty: "hard", is_premium: true, is_pyp: true, attempts: 520, ids: mix([["sub_gs", 15, 12], ["sub_uk_gk", 12, 44], ["sub_current", 8, 8]]) },
  { slug: "uksssc-graduate-level-full-mock-1", title: "UKSSSC Graduate Level Full Mock 1", description: "100-mark pattern practice across GK, Hindi, reasoning and Uttarakhand GK for UKSSSC Graduate Level posts.", exam_id: "exam_uksssc", subject_id: null, difficulty: "medium", is_premium: false, is_pyp: false, attempts: 890, ids: mix([["sub_uk_gk", 12, 20], ["sub_gs", 8, 20], ["sub_hindi", 8, 0], ["sub_reasoning", 6, 0], ["sub_math", 6, 0]]) },
  { slug: "uksssc-hindi-sectional-1", title: "UKSSSC सामान्य हिंदी Sectional 1", description: "संधि, समास, विलोम, पर्यायवाची और मुहावरों पर आधारित 25 प्रश्नों का अभ्यास सेट।", exam_id: "exam_uksssc", subject_id: "sub_hindi", difficulty: "easy", is_premium: false, is_pyp: false, attempts: 730, ids: bySubject("sub_hindi", 25) },
  { slug: "uksssc-graduate-level-2021-pyp", title: "UKSSSC Graduate Level 2021 – Previous Year Paper", description: "Previous-year style paper for UKSSSC Graduate Level 2021 converted to an online timed test.", exam_id: "exam_uksssc", subject_id: null, difficulty: "medium", is_premium: true, is_pyp: true, attempts: 615, ids: mix([["sub_uk_gk", 15, 32], ["sub_gs", 8, 5], ["sub_hindi", 7, 12], ["sub_reasoning", 5, 8], ["sub_math", 5, 10]]) },
  { slug: "uksssc-reasoning-sectional-1", title: "UKSSSC Reasoning Sectional 1", description: "Series, coding-decoding, blood relations and direction sense at exam difficulty.", exam_id: "exam_uksssc", subject_id: "sub_reasoning", difficulty: "medium", is_premium: true, is_pyp: false, attempts: 380, ids: bySubject("sub_reasoning", 20) },
  { slug: "uttarakhand-police-constable-full-mock-1", title: "Uttarakhand Police Constable Full Mock 1", description: "Practice set on the police constable written exam pattern: GK, Uttarakhand GK, reasoning and numerical ability.", exam_id: "exam_police", subject_id: null, difficulty: "easy", is_premium: false, is_pyp: false, attempts: 860, ids: mix([["sub_uk_gk", 14, 28], ["sub_gs", 8, 14], ["sub_reasoning", 8, 6], ["sub_math", 8, 6], ["sub_current", 2, 16]]) },
  { slug: "uttarakhand-police-constable-2022-pyp", title: "Uttarakhand Police Constable 2022 – Previous Year Paper", description: "Previous-year pattern paper for the 2022 constable recruitment, with solutions.", exam_id: "exam_police", subject_id: null, difficulty: "medium", is_premium: true, is_pyp: true, attempts: 560, ids: mix([["sub_uk_gk", 15, 50], ["sub_math", 8, 14], ["sub_reasoning", 7, 12], ["sub_hindi", 5, 18]]) },
  { slug: "patwari-lekhpal-full-mock-1", title: "Patwari / Lekhpal Full Mock 1", description: "Uttarakhand GK, Hindi, arithmetic and reasoning on the Patwari/Lekhpal written exam pattern.", exam_id: "exam_patwari", subject_id: null, difficulty: "medium", is_premium: false, is_pyp: false, attempts: 470, ids: mix([["sub_uk_gk", 14, 40], ["sub_hindi", 8, 8], ["sub_math", 8, 18], ["sub_reasoning", 5, 15]]) },
  { slug: "patwari-lekhpal-2019-pyp", title: "Patwari / Lekhpal 2019 – Previous Year Paper", description: "Previous-year pattern paper for the 2019 Patwari/Lekhpal exam as a timed mock.", exam_id: "exam_patwari", subject_id: null, difficulty: "medium", is_premium: true, is_pyp: true, attempts: 340, ids: mix([["sub_uk_gk", 12, 58], ["sub_gs", 6, 24], ["sub_hindi", 6, 15], ["sub_math", 6, 3]]) },
  { slug: "vdo-full-mock-1", title: "VDO (Gram Vikas Adhikari) Full Mock 1", description: "General knowledge, Uttarakhand affairs and Hindi for the Village Development Officer written test.", exam_id: "exam_vdo", subject_id: null, difficulty: "medium", is_premium: true, is_pyp: false, attempts: 290, ids: mix([["sub_uk_gk", 12, 10], ["sub_current", 8, 12], ["sub_gs", 6, 26], ["sub_hindi", 4, 20]]) },
  { slug: "junior-assistant-computer-sectional-1", title: "Junior Assistant Computer Sectional 1", description: "Computer fundamentals, MS Office and internet basics for clerical-grade posts.", exam_id: "exam_junior_assistant", subject_id: "sub_computer", difficulty: "easy", is_premium: false, is_pyp: false, attempts: 510, ids: bySubject("sub_computer", 10) },
  { slug: "forest-guard-2020-pyp", title: "Forest Guard 2020 – Previous Year Paper", description: "Previous-year pattern paper for the Uttarakhand Forest Guard exam with environment and Uttarakhand GK focus.", exam_id: "exam_forest_guard", subject_id: null, difficulty: "medium", is_premium: true, is_pyp: true, attempts: 300, ids: mix([["sub_env", 10, 0], ["sub_uk_gk", 12, 22], ["sub_gs", 6, 18], ["sub_math", 6, 20], ["sub_reasoning", 4, 2]]) },
  { slug: "group-c-general-studies-mock-1", title: "Group C General Studies Mock 1", description: "Broad general studies practice for UKSSSC Group C posts, including current affairs and English.", exam_id: "exam_group_c", subject_id: null, difficulty: "easy", is_premium: false, is_pyp: false, attempts: 220, ids: mix([["sub_gs", 10, 8], ["sub_current", 8, 4], ["sub_english", 8, 0], ["sub_uk_gk", 6, 66]]) },
  { slug: "utet-2023-paper-1-pedagogy-pyp", title: "UTET 2023 Paper I – Pedagogy Previous Year Paper", description: "Child development and pedagogy questions on the UTET 2023 Paper I pattern. No negative marking.", exam_id: "exam_utet", subject_id: "sub_pedagogy", difficulty: "medium", is_premium: true, is_pyp: true, attempts: 180, ids: bySubject("sub_pedagogy", 10) },
];

export const mockTests: MockTest[] = [];
export const mockTestQuestions: MockTestQuestion[] = [];

specs.forEach((s, i) => {
  const id = `mt_${String(i + 1).padStart(3, "0")}`;
  const count = s.ids.length;
  const pedagogyOnly = s.subject_id === "sub_pedagogy";
  mockTests.push({
    id,
    slug: s.slug,
    title: s.title,
    description: s.description,
    exam_id: s.exam_id,
    subject_id: s.subject_id,
    difficulty: s.difficulty,
    duration_minutes: Math.max(10, Math.round((count * 1.2) / 5) * 5),
    total_marks: count,
    negative_marks: pedagogyOnly ? 0 : 0.25,
    question_count: count,
    is_premium: s.is_premium,
    is_published: true,
    is_pyp: s.is_pyp,
    attempts_count: s.attempts,
    created_at: daysAgo(20 + i * 9),
  });
  s.ids.forEach((qid, n) => {
    mockTestQuestions.push({ id: `mtq_${id}_${n + 1}`, mock_test_id: id, question_id: qid, sort_order: n + 1 });
  });
});

/** Ordered question ids for a mock test (used by the users seed). */
export function mockQuestionIds(mockTestId: string): string[] {
  return mockTestQuestions.filter((r) => r.mock_test_id === mockTestId).sort((a, b) => a.sort_order - b.sort_order).map((r) => r.question_id);
}
