import type {
  Bookmark, OptionKey, Payment, Profile, StudyProgress, Subscription, TestAnswer, TestAttempt, User,
} from "@/lib/types";
import { daysAgo, daysFromNow, SEED_NOW } from "./constants";
import { mockTests, mockQuestionIds } from "./mockTests";
import { questions } from "./questions";

const HASH =
  "scrypt$devbhoomi0000000000000000000000d$8b19a10638eefce5b4dc320f2c32ecfa4f1fcabcca67255326e61f37d9497b76cb6d10c2781150ad5e75106b6eff79ed1a3fad23a39635c8f58da13c208a2b4c";

function user(id: string, email: string, full_name: string, opts: Partial<User> = {}): User {
  return {
    id,
    email,
    full_name,
    mobile: null,
    role: "student",
    is_blocked: false,
    email_verified: true,
    created_at: daysAgo(60),
    password_hash: HASH,
    verification_token: null,
    reset_token: null,
    reset_token_expires_at: null,
    ...opts,
  };
}

export const users: User[] = [
  user("user_admin", "admin@devbhoomiprep.in", "Devbhoomi Admin", { role: "admin", mobile: "+91 94100 00000", created_at: daysAgo(400) }),
  user("user_student", "student@example.com", "Aarav Rawat", { mobile: "+91 98370 12345", created_at: daysAgo(12) }),
  user("user_priya", "priya@example.com", "Priya Negi", { mobile: "+91 97600 45210", created_at: daysAgo(70) }),
  user("user_blocked", "blocked@example.com", "Rohit Sharma", { mobile: "+91 99170 11223", is_blocked: true, created_at: daysAgo(90) }),
  user("user_bisht", "kavita.bisht@example.com", "Kavita Bisht", { mobile: "+91 94120 55667", created_at: daysAgo(45) }),
  user("user_rawat2", "deepak.rawat@example.com", "Deepak Rawat", { mobile: "+91 98970 33445", created_at: daysAgo(35) }),
  user("user_negi2", "anjali.negi@example.com", "Anjali Negi", { mobile: "+91 97190 22334", created_at: daysAgo(80) }),
  user("user_bhandari", "suresh.bhandari@example.com", "Suresh Bhandari", { mobile: "+91 94110 77889", created_at: daysAgo(25) }),
  user("user_joshi", "meenakshi.joshi@example.com", "Meenakshi Joshi", { mobile: "+91 96340 99001", created_at: daysAgo(150) }),
  user("user_pant", "himanshu.pant@example.com", "Himanshu Pant", { mobile: "+91 98380 66778", created_at: daysAgo(20) }),
  user("user_chauhan", "neha.chauhan@example.com", "Neha Chauhan", { mobile: "+91 97560 44556", created_at: daysAgo(8) }),
  user("user_kandpal", "manoj.kandpal@example.com", "Manoj Kandpal", { mobile: "+91 94560 12398", created_at: daysAgo(110) }),
];

function profile(user_id: string, startedDaysAgo: number, opts: Partial<Profile> = {}): Profile {
  return {
    user_id,
    preferred_exam_id: null,
    education_level: "Graduate",
    trial_started_at: daysAgo(startedDaysAgo),
    trial_ends_at: daysAgo(startedDaysAgo - 30),
    study_streak_days: 0,
    last_active_date: null,
    updated_at: SEED_NOW,
    ...opts,
  };
}

export const profiles: Profile[] = [
  profile("user_admin", 400, { trial_ends_at: daysAgo(370), preferred_exam_id: null, education_level: null }),
  profile("user_student", 12, { trial_ends_at: daysFromNow(18), preferred_exam_id: "exam_uksssc", study_streak_days: 5, last_active_date: "2026-09-01" }),
  profile("user_priya", 70, { trial_ends_at: daysAgo(40), preferred_exam_id: "exam_ukpsc", education_level: "Post Graduate", study_streak_days: 12, last_active_date: "2026-08-31" }),
  profile("user_blocked", 90, { trial_ends_at: daysAgo(60), preferred_exam_id: "exam_police" }),
  profile("user_bisht", 45, { trial_ends_at: daysAgo(15), preferred_exam_id: "exam_patwari", study_streak_days: 2, last_active_date: "2026-08-29" }),
  profile("user_rawat2", 35, { trial_ends_at: daysAgo(5), preferred_exam_id: "exam_police", study_streak_days: 0, last_active_date: "2026-08-24" }),
  profile("user_negi2", 80, { trial_ends_at: daysAgo(50), preferred_exam_id: "exam_utet", education_level: "B.Ed", study_streak_days: 3, last_active_date: "2026-08-30" }),
  profile("user_bhandari", 25, { trial_ends_at: daysFromNow(5), preferred_exam_id: "exam_forest_guard", education_level: "12th Pass", study_streak_days: 7, last_active_date: "2026-09-01" }),
  profile("user_joshi", 150, { trial_ends_at: daysAgo(120), preferred_exam_id: "exam_ukpsc", education_level: "Post Graduate", study_streak_days: 1, last_active_date: "2026-08-28" }),
  profile("user_pant", 20, { trial_ends_at: daysFromNow(10), preferred_exam_id: "exam_uksssc", study_streak_days: 4, last_active_date: "2026-09-01" }),
  profile("user_chauhan", 8, { trial_ends_at: daysFromNow(22), preferred_exam_id: "exam_vdo", study_streak_days: 6, last_active_date: "2026-09-01" }),
  profile("user_kandpal", 110, { trial_ends_at: daysAgo(80), preferred_exam_id: "exam_junior_assistant", education_level: "12th Pass" }),
];

export const payments: Payment[] = [
  {
    id: "pay_0001", user_id: "user_priya", plan_id: "yearly", amount: 149900, currency: "INR", receipt: "rcpt_2026_0001",
    razorpay_order_id: "order_DemoPriyaYearly01", razorpay_payment_id: "pay_DemoPriyaYearly01", razorpay_signature: "demo_signature_0001",
    status: "paid", method: "upi", failure_reason: null, refund_status: null, invoice_number: "INV-2026-0001",
    paid_at: daysAgo(65), created_at: daysAgo(65),
  },
  {
    id: "pay_0002", user_id: "user_joshi", plan_id: "monthly", amount: 19900, currency: "INR", receipt: "rcpt_2026_0002",
    razorpay_order_id: "order_DemoJoshiMonthly01", razorpay_payment_id: "pay_DemoJoshiMonthly01", razorpay_signature: "demo_signature_0002",
    status: "paid", method: "card", failure_reason: null, refund_status: null, invoice_number: "INV-2026-0002",
    paid_at: daysAgo(100), created_at: daysAgo(100),
  },
  {
    id: "pay_0003", user_id: "user_rawat2", plan_id: "quarterly", amount: 49900, currency: "INR", receipt: "rcpt_2026_0003",
    razorpay_order_id: "order_DemoRawatQuarterly01", razorpay_payment_id: null, razorpay_signature: null,
    status: "failed", method: "card", failure_reason: "Payment declined by bank", refund_status: null, invoice_number: null,
    paid_at: null, created_at: daysAgo(4),
  },
];

export const subscriptions: Subscription[] = [
  {
    id: "sub_0001", user_id: "user_priya", plan_id: "yearly", status: "active", source: "razorpay",
    starts_at: daysAgo(65), ends_at: daysFromNow(300), payment_id: "pay_0001", note: null, created_at: daysAgo(65),
  },
  {
    id: "sub_0002", user_id: "user_joshi", plan_id: "monthly", status: "expired", source: "razorpay",
    starts_at: daysAgo(100), ends_at: daysAgo(70), payment_id: "pay_0002", note: null, created_at: daysAgo(100),
  },
  {
    id: "sub_0003", user_id: "user_negi2", plan_id: "quarterly", status: "active", source: "manual",
    starts_at: daysAgo(20), ends_at: daysFromNow(70), payment_id: null, note: "Scholarship – activated by admin", created_at: daysAgo(20),
  },
];

/* ------------------------------------------------------------------------ */
/* Test attempts                                                             */
/* ------------------------------------------------------------------------ */

const mockById = new Map(mockTests.map((m) => [m.id, m]));
const questionById = new Map(questions.map((q) => [q.id, q]));

interface AttemptSpec {
  id: string;
  user_id: string;
  mock: string;
  daysAgo: number;
  correct: number;
  incorrect: number;
  timeFraction: number; // fraction of duration used
  percentile?: number | null;
}

function buildAttempt(s: AttemptSpec): TestAttempt {
  const mock = mockById.get(s.mock)!;
  const ids = mockQuestionIds(s.mock);
  const total = ids.length;
  const attempted = s.correct + s.incorrect;
  const unattempted = total - attempted;
  const score = Math.round((s.correct * 1 - s.incorrect * mock.negative_marks) * 100) / 100;
  const percentage = Math.max(0, Math.round((score / mock.total_marks) * 1000) / 10);
  const accuracy = attempted ? Math.round((s.correct / attempted) * 1000) / 10 : 0;
  const time = Math.round(mock.duration_minutes * 60 * s.timeFraction);
  const started = daysAgo(s.daysAgo);
  return {
    id: s.id,
    user_id: s.user_id,
    mock_test_id: mock.id,
    title: mock.title,
    exam_id: mock.exam_id,
    subject_id: mock.subject_id,
    status: "submitted",
    question_ids: ids,
    config: null,
    duration_minutes: mock.duration_minutes,
    started_at: started,
    submitted_at: new Date(new Date(started).getTime() + time * 1000).toISOString(),
    time_taken_seconds: time,
    total_questions: total,
    attempted,
    correct: s.correct,
    incorrect: s.incorrect,
    unattempted,
    score,
    total_marks: mock.total_marks,
    percentage,
    accuracy,
    percentile: s.percentile ?? null,
    created_at: started,
  };
}

// Aarav's journey: mt_004 (UKSSSC full, 40q), mt_005 (Hindi, 25q), mt_007 (Reasoning, 20q), mt_008 (Police full, 40q), mt_001 (UKPSC full, 38q)
const aaravSpecs: AttemptSpec[] = [
  { id: "att_0001", user_id: "user_student", mock: "mt_004", daysAgo: 39, correct: 17, incorrect: 14, timeFraction: 0.98 },
  { id: "att_0002", user_id: "user_student", mock: "mt_005", daysAgo: 36, correct: 13, incorrect: 8, timeFraction: 0.9 },
  { id: "att_0003", user_id: "user_student", mock: "mt_007", daysAgo: 33, correct: 9, incorrect: 8, timeFraction: 0.95 },
  { id: "att_0004", user_id: "user_student", mock: "mt_008", daysAgo: 30, correct: 20, incorrect: 12, timeFraction: 0.97 },
  { id: "att_0005", user_id: "user_student", mock: "mt_004", daysAgo: 27, correct: 21, incorrect: 12, timeFraction: 0.93 },
  { id: "att_0006", user_id: "user_student", mock: "mt_005", daysAgo: 24, correct: 16, incorrect: 6, timeFraction: 0.82 },
  { id: "att_0007", user_id: "user_student", mock: "mt_001", daysAgo: 21, correct: 16, incorrect: 14, timeFraction: 0.99 },
  { id: "att_0008", user_id: "user_student", mock: "mt_007", daysAgo: 18, correct: 12, incorrect: 6, timeFraction: 0.88 },
  { id: "att_0009", user_id: "user_student", mock: "mt_008", daysAgo: 15, correct: 25, incorrect: 9, timeFraction: 0.9 },
  { id: "att_0010", user_id: "user_student", mock: "mt_004", daysAgo: 11, correct: 25, incorrect: 9, timeFraction: 0.87 },
  { id: "att_0011", user_id: "user_student", mock: "mt_001", daysAgo: 8, correct: 20, incorrect: 11, timeFraction: 0.95, percentile: 58.4 },
  { id: "att_0012", user_id: "user_student", mock: "mt_005", daysAgo: 5, correct: 20, incorrect: 3, timeFraction: 0.76, percentile: 81.2 },
  { id: "att_0013", user_id: "user_student", mock: "mt_007", daysAgo: 3, correct: 15, incorrect: 3, timeFraction: 0.8, percentile: 77.5 },
  { id: "att_0014", user_id: "user_student", mock: "mt_004", daysAgo: 1, correct: 29, incorrect: 7, timeFraction: 0.84, percentile: 72.9 },
];

const otherSpecs: AttemptSpec[] = [
  { id: "att_0101", user_id: "user_priya", mock: "mt_004", daysAgo: 20, correct: 33, incorrect: 5, timeFraction: 0.8 },
  { id: "att_0102", user_id: "user_priya", mock: "mt_001", daysAgo: 14, correct: 28, incorrect: 7, timeFraction: 0.9 },
  { id: "att_0103", user_id: "user_bisht", mock: "mt_005", daysAgo: 10, correct: 14, incorrect: 9, timeFraction: 0.95 },
  { id: "att_0104", user_id: "user_pant", mock: "mt_004", daysAgo: 6, correct: 19, incorrect: 16, timeFraction: 1 },
  { id: "att_0105", user_id: "user_bhandari", mock: "mt_007", daysAgo: 4, correct: 10, incorrect: 9, timeFraction: 0.97 },
  { id: "att_0106", user_id: "user_chauhan", mock: "mt_008", daysAgo: 2, correct: 22, incorrect: 13, timeFraction: 0.92 },
];

const inProgress: TestAttempt = {
  id: "att_0200",
  user_id: "user_student",
  mock_test_id: "mt_010",
  title: mockById.get("mt_010")!.title,
  exam_id: "exam_patwari",
  subject_id: null,
  status: "in_progress",
  question_ids: mockQuestionIds("mt_010"),
  config: null,
  duration_minutes: mockById.get("mt_010")!.duration_minutes,
  started_at: SEED_NOW,
  submitted_at: null,
  time_taken_seconds: null,
  total_questions: mockQuestionIds("mt_010").length,
  attempted: 0,
  correct: 0,
  incorrect: 0,
  unattempted: mockQuestionIds("mt_010").length,
  score: 0,
  total_marks: mockById.get("mt_010")!.total_marks,
  percentage: 0,
  accuracy: 0,
  percentile: null,
  created_at: SEED_NOW,
};

export const attempts: TestAttempt[] = [...aaravSpecs.map(buildAttempt), ...otherSpecs.map(buildAttempt), inProgress];

/* Answers for Aarav's 3 most recent submitted attempts (att_0012, att_0013, att_0014) */
const OPTS: OptionKey[] = ["A", "B", "C", "D"];

function buildAnswers(attempt: TestAttempt): TestAnswer[] {
  const out: TestAnswer[] = [];
  attempt.question_ids.forEach((qid, i) => {
    const q = questionById.get(qid)!;
    let selected: OptionKey | null = null;
    let is_correct: boolean | null = null;
    if (i < attempt.correct) {
      selected = q.correct_option;
      is_correct = true;
    } else if (i < attempt.correct + attempt.incorrect) {
      selected = OPTS[(OPTS.indexOf(q.correct_option) + 1 + (i % 3)) % 4];
      is_correct = false;
    }
    out.push({
      id: `ans_${attempt.id}_${i + 1}`,
      attempt_id: attempt.id,
      question_id: qid,
      selected_option: selected,
      is_correct,
      marked_for_review: i % 9 === 4,
      time_spent_seconds: 20 + ((i * 17 + attempt.id.length) % 70),
      updated_at: attempt.submitted_at ?? attempt.started_at,
    });
  });
  return out;
}

export const answers: TestAnswer[] = ["att_0012", "att_0013", "att_0014"]
  .map((id) => attempts.find((a) => a.id === id)!)
  .flatMap(buildAnswers);

export const bookmarks: Bookmark[] = [
  { id: "bm_0001", user_id: "user_student", item_type: "book", item_id: "book_001", created_at: daysAgo(10) },
  { id: "bm_0002", user_id: "user_student", item_type: "book", item_id: "book_004", created_at: daysAgo(9) },
  { id: "bm_0003", user_id: "user_student", item_type: "note", item_id: "note_001", created_at: daysAgo(7) },
  { id: "bm_0004", user_id: "user_student", item_type: "question", item_id: "q_0003", created_at: daysAgo(5) },
  { id: "bm_0005", user_id: "user_student", item_type: "question", item_id: "q_0120", created_at: daysAgo(3) },
  { id: "bm_0006", user_id: "user_student", item_type: "mock_test", item_id: "mt_006", created_at: daysAgo(2) },
];

export const progress: StudyProgress[] = [
  { id: "prog_0001", user_id: "user_student", item_type: "book", item_id: "book_001", progress_percent: 42, last_position: 134, seconds_spent: 14_400, updated_at: daysAgo(1) },
  { id: "prog_0002", user_id: "user_student", item_type: "book", item_id: "book_004", progress_percent: 68, last_position: 143, seconds_spent: 9_800, updated_at: daysAgo(2) },
  { id: "prog_0003", user_id: "user_student", item_type: "note", item_id: "note_001", progress_percent: 100, last_position: 48, seconds_spent: 3_600, updated_at: daysAgo(4) },
  { id: "prog_0004", user_id: "user_student", item_type: "note", item_id: "note_009", progress_percent: 25, last_position: 11, seconds_spent: 1_500, updated_at: daysAgo(3) },
  { id: "prog_0005", user_id: "user_student", item_type: "book", item_id: "book_006", progress_percent: 12, last_position: 43, seconds_spent: 2_700, updated_at: daysAgo(6) },
];
