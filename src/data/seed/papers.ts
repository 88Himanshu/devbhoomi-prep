import type { Language, PaperType, PreviousYearPaper } from "@/lib/types";
import { daysAgo } from "./constants";

type Spec = [
  title: string,
  exam: string,
  year: number,
  type: PaperType,
  subject: string | null,
  questions: number,
  duration: number,
  premium: boolean,
  mock?: string,
  language?: Language,
];

const specs: Spec[] = [
  ["UKPSC Upper PCS Prelims 2021 – General Studies Paper I", "exam_ukpsc", 2021, "prelims", null, 150, 120, true, "mt_003"],
  ["UKPSC Upper PCS Prelims 2016 – General Studies Paper I", "exam_ukpsc", 2016, "prelims", null, 150, 120, false],
  ["UKPSC Upper PCS Prelims 2012 (Held 2013) – General Aptitude (CSAT)", "exam_ukpsc", 2013, "prelims", "sub_reasoning", 100, 120, false],
  ["UKPSC Lower PCS 2016 – Prelims Paper", "exam_ukpsc", 2016, "prelims", null, 150, 120, true],
  ["UKSSSC Graduate Level Exam 2021 – Paper", "exam_uksssc", 2021, "written", null, 100, 120, true, "mt_006"],
  ["UKSSSC Graduate Level Exam 2016 – Paper", "exam_uksssc", 2016, "written", null, 100, 120, false],
  ["UKSSSC Junior Assistant / Computer Operator 2019 – Paper", "exam_junior_assistant", 2019, "written", null, 100, 120, false],
  ["UKSSSC Junior Assistant 2023 – Paper", "exam_junior_assistant", 2023, "written", null, 100, 120, true],
  ["Uttarakhand Police Constable 2022 – Written Paper", "exam_police", 2022, "written", null, 100, 120, true, "mt_009"],
  ["Uttarakhand Police Constable 2018 – Written Paper", "exam_police", 2018, "written", null, 100, 120, false],
  ["Uttarakhand Police SI 2021 – Paper I (General Hindi)", "exam_police", 2021, "written", "sub_hindi", 100, 120, false],
  ["Patwari / Lekhpal 2019 – Written Paper", "exam_patwari", 2019, "written", null, 100, 120, true, "mt_011"],
  ["Patwari / Lekhpal 2023 – Written Paper", "exam_patwari", 2023, "written", null, 100, 120, true],
  ["VDO (Gram Panchayat Vikas Adhikari) 2018 – Paper", "exam_vdo", 2018, "written", null, 100, 120, false],
  ["VDO 2023 – Paper", "exam_vdo", 2023, "written", null, 100, 120, true],
  ["Forest Guard 2020 – Written Paper", "exam_forest_guard", 2020, "written", null, 100, 120, true, "mt_014"],
  ["Forest Guard 2017 – Written Paper", "exam_forest_guard", 2017, "written", null, 100, 120, false],
  ["UKSSSC Group C (Sahayak Lekhakar) 2022 – Paper", "exam_group_c", 2022, "written", null, 100, 120, false],
  ["LT Grade Assistant Teacher 2020 – Social Science Paper", "exam_teaching", 2020, "written", "sub_gs", 150, 180, true],
  ["UTET 2023 – Paper I", "exam_utet", 2023, "written", "sub_pedagogy", 150, 150, false, "mt_016"],
];

export const papers: PreviousYearPaper[] = specs.map((s, i) => {
  const [title, exam_id, year, paper_type, subject_id, total_questions, duration_minutes, is_premium, mock, language] = s;
  return {
    id: `pyp_${String(i + 1).padStart(3, "0")}`,
    exam_id,
    subject_id,
    year,
    paper_type,
    title,
    total_questions,
    duration_minutes,
    language: language ?? (subject_id === "sub_hindi" ? "hi" : "bilingual"),
    file_path: "samples/sample-paper.pdf",
    mock_test_id: mock ?? null,
    is_premium,
    is_published: true,
    downloads: 120 + ((i * 53) % 900) + (2024 - year) * 15,
    created_at: daysAgo(30 + i * 13),
  };
});
