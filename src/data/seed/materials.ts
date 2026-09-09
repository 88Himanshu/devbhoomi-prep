import type { Language, Material, SourceLicense } from "@/lib/types";
import { daysAgo } from "./constants";

const COLORS = ["#163e86", "#1e4fa3", "#1b7f4f", "#166a42", "#b07200", "#0f2f6b", "#23905c"];
const TEAM = "Devbhoomi Prep Editorial Team";
const PUBLIC = "Public domain (NCERT-style summary)";

type Spec = [
  title: string,
  slug: string,
  description: string,
  subject: string,
  exams: string[],
  language: Language,
  year: number,
  pages: number,
  premium: boolean,
  author?: string,
];

function build(kind: "book" | "note", prefix: string, specs: Spec[], featured: number[]): Material[] {
  return specs.map((s, i) => {
    const n = i + 1;
    const [title, slug, description, subject_id, exam_ids, language, year, pages, is_premium, author] = s;
    const seed = (n * 37 + (kind === "book" ? 11 : 23)) % 100;
    return {
      id: `${prefix}${String(n).padStart(3, "0")}`,
      kind,
      slug,
      title,
      description,
      subject_id,
      exam_ids,
      author: author ?? TEAM,
      language,
      year,
      pages,
      file_path: "samples/sample-material.pdf",
      preview_path: "samples/sample-preview.pdf",
      cover_color: COLORS[n % COLORS.length],
      source_license: (author === PUBLIC ? "public_domain" : "original") as SourceLicense,
      is_premium,
      is_published: true,
      is_featured: featured.includes(n),
      views: 300 + seed * 85 + n * 40,
      downloads: 60 + seed * 17 + n * 9,
      created_at: daysAgo(15 + n * 11),
    };
  });
}

const bookSpecs: Spec[] = [
  ["Uttarakhand GK Complete Notes (Hindi)", "uttarakhand-gk-complete-notes-hindi", "उत्तराखंड का इतिहास, भूगोल, संस्कृति, प्रशासन और समसामयिक तथ्यों का सम्पूर्ण संकलन। UKSSSC, पुलिस और पटवारी परीक्षाओं के लिए अध्यायवार अभ्यास प्रश्न सहित।", "sub_uk_gk", ["exam_uksssc", "exam_police", "exam_patwari", "exam_vdo"], "hi", 2026, 320, true],
  ["Uttarakhand General Knowledge: The Complete Reference", "uttarakhand-gk-complete-reference", "Chapter-wise coverage of Uttarakhand history, geography, polity, economy, culture and environment with 900+ practice MCQs and key facts tables.", "sub_uk_gk", ["exam_ukpsc", "exam_uksssc", "exam_forest_guard"], "en", 2026, 384, true],
  ["UKSSSC Graduate Level: 1500 Practice MCQs", "uksssc-graduate-level-1500-mcqs", "Subject-wise practice sets modelled on the UKSSSC Graduate Level pattern, with answer keys and short explanations for every question.", "sub_gs", ["exam_uksssc", "exam_junior_assistant"], "bilingual", 2025, 296, true],
  ["Reasoning Practice Workbook Vol. 1", "reasoning-practice-workbook-vol-1", "Coding-decoding, series, blood relations, syllogism, direction sense and puzzles with graded difficulty and solved examples.", "sub_reasoning", ["exam_uksssc", "exam_police", "exam_patwari", "exam_junior_assistant"], "en", 2024, 210, false],
  ["Reasoning Practice Workbook Vol. 2", "reasoning-practice-workbook-vol-2", "Advanced analytical and non-verbal reasoning: seating arrangement, data sufficiency, mirror images and cube problems.", "sub_reasoning", ["exam_uksssc", "exam_ukpsc"], "en", 2025, 198, true],
  ["Quantitative Aptitude for Uttarakhand Exams", "quantitative-aptitude-uttarakhand-exams", "Arithmetic, percentages, ratio, time & work, speed-distance, mensuration and data interpretation with shortcut methods and 1200 solved problems.", "sub_math", ["exam_uksssc", "exam_police", "exam_patwari", "exam_forest_guard"], "bilingual", 2025, 360, true],
  ["सामान्य हिंदी: व्याकरण एवं अभ्यास", "samanya-hindi-vyakaran-abhyas", "संधि, समास, विलोम, पर्यायवाची, मुहावरे-लोकोक्तियाँ, वर्तनी शुद्धि और अपठित गद्यांश पर आधारित अभ्यास प्रश्नों सहित सम्पूर्ण हिंदी व्याकरण।", "sub_hindi", ["exam_uksssc", "exam_patwari", "exam_vdo", "exam_police"], "hi", 2025, 268, true],
  ["English Grammar & Comprehension Essentials", "english-grammar-comprehension-essentials", "Parts of speech, tenses, error spotting, sentence improvement, vocabulary and reading comprehension for state-level competitive exams.", "sub_english", ["exam_uksssc", "exam_junior_assistant", "exam_teaching"], "en", 2024, 224, false],
  ["Indian Polity Simplified", "indian-polity-simplified", "Constitution, fundamental rights, Parliament, judiciary, Panchayati Raj and constitutional bodies explained with charts and previous-year questions.", "sub_gs", ["exam_ukpsc", "exam_uksssc"], "en", 2025, 340, true],
  ["Indian History: Ancient to Modern (NCERT-based Summary)", "indian-history-ncert-based-summary", "Concise summary of NCERT history textbooks (Class 6–12) organised for competitive exams, with timelines and revision points.", "sub_gs", ["exam_ukpsc", "exam_uksssc", "exam_teaching"], "en", 2023, 300, false, PUBLIC],
  ["Geography of India & Uttarakhand", "geography-india-uttarakhand", "Physical, economic and human geography of India with a dedicated section on Uttarakhand's rivers, glaciers, districts and climate.", "sub_gs", ["exam_ukpsc", "exam_uksssc", "exam_forest_guard"], "bilingual", 2025, 312, true],
  ["Environment, Ecology & Forestry for Forest Guard", "environment-ecology-forestry-forest-guard", "Forest types, wildlife acts, national parks and sanctuaries of Uttarakhand, biodiversity and climate change with 500 MCQs.", "sub_env", ["exam_forest_guard", "exam_ukpsc"], "bilingual", 2025, 240, true],
  ["Computer Fundamentals for Junior Assistant & Group C", "computer-fundamentals-junior-assistant", "Hardware, software, MS Office, internet, email, cyber security basics and typing test guidance for clerical exams.", "sub_computer", ["exam_junior_assistant", "exam_group_c", "exam_uksssc"], "en", 2024, 180, false],
  ["Child Development & Pedagogy for UTET", "child-development-pedagogy-utet", "Theories of learning, inclusive education, assessment, and classroom management aligned to UTET Paper I and II.", "sub_pedagogy", ["exam_utet", "exam_teaching"], "bilingual", 2025, 256, true],
  ["Uttarakhand Police Constable Practice Book", "uttarakhand-police-constable-practice-book", "Ten full-length practice sets covering GK, reasoning, numerical ability and Uttarakhand-specific questions with detailed answers.", "sub_uk_gk", ["exam_police"], "hi", 2025, 288, false],
  ["Patwari / Lekhpal Complete Guide", "patwari-lekhpal-complete-guide", "Land records terminology, Uttarakhand revenue administration, GK, Hindi and arithmetic in one structured guide.", "sub_uk_gk", ["exam_patwari"], "bilingual", 2026, 330, true],
  ["General Science Made Easy", "general-science-made-easy", "Physics, chemistry and biology fundamentals from NCERT Class 6–10 summarised for objective exams with formula sheets.", "sub_gs", ["exam_uksssc", "exam_police", "exam_forest_guard"], "en", 2023, 260, false, PUBLIC],
  ["Current Affairs Yearbook 2025–26", "current-affairs-yearbook-2025-26", "Monthly compiled national, international and Uttarakhand current affairs with schemes, awards, sports and reports.", "sub_current", ["exam_ukpsc", "exam_uksssc", "exam_police", "exam_vdo"], "bilingual", 2026, 400, true],
];

const noteSpecs: Spec[] = [
  ["Uttarakhand Geography Quick Revision", "uttarakhand-geography-quick-revision", "One-stop revision of Uttarakhand's physiography, rivers, glaciers, lakes, passes, districts and climate with maps.", "sub_uk_gk", ["exam_uksssc", "exam_police", "exam_patwari"], "en", 2026, 48, false],
  ["Uttarakhand History: Freedom Movement to Statehood", "uttarakhand-history-freedom-statehood", "Kumaon and Garhwal freedom struggle, Coolie-Begar, Tehri Rajya Andolan, Chipko and the statehood movement in concise notes.", "sub_uk_gk", ["exam_uksssc", "exam_ukpsc", "exam_vdo"], "bilingual", 2025, 64, true],
  ["उत्तराखंड की लोक संस्कृति एवं परम्पराएँ", "uttarakhand-lok-sanskriti-paramparayen", "लोकनृत्य, लोकगीत, वाद्ययंत्र, मेले-त्योहार, वेशभूषा और प्रमुख व्यक्तित्वों पर संक्षिप्त नोट्स।", "sub_uk_gk", ["exam_uksssc", "exam_police", "exam_patwari", "exam_forest_guard"], "hi", 2025, 56, true],
  ["Uttarakhand Districts at a Glance", "uttarakhand-districts-at-a-glance", "District-wise tables: headquarters, area, population, famous places, rivers and industries for all 13 districts.", "sub_uk_gk", ["exam_uksssc", "exam_police", "exam_vdo"], "en", 2026, 40, false],
  ["National Parks & Sanctuaries of Uttarakhand", "national-parks-sanctuaries-uttarakhand", "Protected areas, biosphere reserves, Ramsar sites and conservation projects of Uttarakhand with year of establishment.", "sub_env", ["exam_forest_guard", "exam_uksssc"], "bilingual", 2025, 44, false],
  ["Indian Constitution: Articles & Schedules Cheat Sheet", "indian-constitution-articles-schedules", "Important articles, parts, schedules and amendments in tabular form for rapid revision.", "sub_gs", ["exam_ukpsc", "exam_uksssc"], "en", 2024, 52, true],
  ["Economy Basics & Budget Highlights", "economy-basics-budget-highlights", "Key economic concepts, national income, inflation, banking and current Union and Uttarakhand budget highlights.", "sub_gs", ["exam_ukpsc", "exam_uksssc"], "en", 2026, 60, true],
  ["Modern Indian History Timeline", "modern-indian-history-timeline", "Year-wise timeline from 1757 to 1947 with governors-general, movements, sessions and acts.", "sub_gs", ["exam_ukpsc", "exam_uksssc", "exam_teaching"], "en", 2023, 46, false, PUBLIC],
  ["हिंदी व्याकरण: संधि एवं समास", "hindi-vyakaran-sandhi-samas", "संधि के भेद, समास के प्रकार, उदाहरण और परीक्षाओं में पूछे गए प्रश्नों का संकलन।", "sub_hindi", ["exam_uksssc", "exam_patwari", "exam_police"], "hi", 2025, 42, false],
  ["हिंदी: पर्यायवाची, विलोम एवं मुहावरे", "hindi-paryayvachi-vilom-muhavare", "परीक्षोपयोगी 600+ पर्यायवाची, विलोम शब्द तथा मुहावरे-लोकोक्तियाँ अर्थ सहित।", "sub_hindi", ["exam_uksssc", "exam_vdo", "exam_patwari"], "hi", 2026, 58, true],
  ["English Vocabulary Booster: Synonyms, Antonyms & One-Word Substitution", "english-vocabulary-booster", "High-frequency vocabulary lists with usage examples and quick quizzes.", "sub_english", ["exam_uksssc", "exam_junior_assistant"], "en", 2025, 50, true],
  ["Maths Formula Sheet & Shortcuts", "maths-formula-sheet-shortcuts", "All essential formulas for arithmetic, algebra, geometry and mensuration with Vedic-style shortcuts.", "sub_math", ["exam_uksssc", "exam_police", "exam_patwari", "exam_forest_guard"], "bilingual", 2025, 36, false],
  ["Percentage, Profit & Loss: Solved Practice Set", "percentage-profit-loss-practice-set", "120 solved questions on percentages, profit-loss, discount and simple/compound interest with step-by-step methods.", "sub_math", ["exam_uksssc", "exam_police"], "en", 2024, 62, true],
  ["Reasoning: Series & Coding-Decoding Tricks", "reasoning-series-coding-decoding-tricks", "Pattern types, letter-number positions and time-saving techniques with 150 practice questions.", "sub_reasoning", ["exam_uksssc", "exam_police", "exam_junior_assistant"], "en", 2025, 54, false],
  ["Computer Awareness One-Liners", "computer-awareness-one-liners", "500 one-liner facts on hardware, software, networking, MS Office shortcuts and internet terms.", "sub_computer", ["exam_junior_assistant", "exam_group_c"], "en", 2024, 38, false],
  ["UTET Pedagogy Revision Notes", "utet-pedagogy-revision-notes", "Piaget, Vygotsky, Kohlberg, learning theories, RTE Act and NCF highlights for UTET Paper I & II.", "sub_pedagogy", ["exam_utet", "exam_teaching"], "bilingual", 2025, 66, true],
  ["Uttarakhand Current Affairs: Last 6 Months", "uttarakhand-current-affairs-last-6-months", "State schemes, appointments, awards, sports and events from Uttarakhand compiled monthly.", "sub_current", ["exam_uksssc", "exam_police", "exam_patwari", "exam_vdo"], "bilingual", 2026, 72, true],
  ["Government Schemes of Uttarakhand", "government-schemes-uttarakhand", "Major state welfare schemes with launch year, department, beneficiaries and objectives.", "sub_current", ["exam_uksssc", "exam_vdo", "exam_ukpsc"], "en", 2026, 44, true],
];

export const books: Material[] = build("book", "book_", bookSpecs, [1, 3]);
export const notes: Material[] = build("note", "note_", noteSpecs, [1, 17]);
