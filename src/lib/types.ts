/**
 * Domain types for Devbhoomi Prep.
 * These mirror the PostgreSQL schema in supabase/migrations and are the
 * single source of truth for both the demo (local JSON) and Supabase backends.
 */

export type Role = "student" | "admin";
export type Language = "en" | "hi" | "bilingual";
export type Difficulty = "easy" | "medium" | "hard";
export type OptionKey = "A" | "B" | "C" | "D";
export type PaperType = "prelims" | "mains" | "screening" | "written" | "other";
export type PlanId = "monthly" | "quarterly" | "yearly";
export type SubscriptionStatus = "active" | "expired" | "cancelled";
export type SubscriptionSource = "razorpay" | "manual";
export type PaymentStatus = "created" | "paid" | "failed" | "refunded";
export type AttemptStatus = "in_progress" | "submitted";
export type BookmarkType = "book" | "note" | "question" | "mock_test";
export type ProgressItemType = "book" | "note" | "exam";
export type SourceLicense = "original" | "licensed" | "public_domain" | "authorized";
export type AnnouncementType = "banner" | "announcement";

/** ISO-8601 timestamp string */
export type ISODate = string;

export interface User {
  id: string;
  email: string;
  full_name: string;
  mobile: string | null;
  role: Role;
  is_blocked: boolean;
  email_verified: boolean;
  created_at: ISODate;
  /** Demo backend only. Never present in Supabase mode (auth.users owns credentials). */
  password_hash?: string | null;
  /** Demo backend only: pending email verification / password reset tokens. */
  verification_token?: string | null;
  reset_token?: string | null;
  reset_token_expires_at?: ISODate | null;
}

export interface Profile {
  user_id: string;
  preferred_exam_id: string | null;
  education_level: string | null;
  trial_started_at: ISODate;
  trial_ends_at: ISODate;
  study_streak_days: number;
  last_active_date: string | null; // YYYY-MM-DD
  updated_at: ISODate;
}

export interface SyllabusSection {
  title: string;
  topics: string[];
}

export interface ExamPatternRow {
  stage: string;
  subject: string;
  questions: number;
  marks: number;
  duration: string;
  negative_marking: string;
}

export interface StudyPlanWeek {
  week: number;
  focus: string;
  tasks: string[];
}

export interface Exam {
  id: string;
  slug: string;
  name: string;
  short_name: string;
  conducting_body: string;
  category: string; // e.g. "State PSC", "Police", "Group C", "Teaching"
  tagline: string;
  overview: string; // multi-paragraph text separated by \n\n
  eligibility: string[];
  syllabus: SyllabusSection[];
  exam_pattern: ExamPatternRow[];
  study_plan: StudyPlanWeek[];
  important_question_ids: string[];
  icon: string; // lucide icon name, e.g. "Landmark"
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: ISODate;
}

export interface Subject {
  id: string;
  slug: string;
  name: string;
  icon: string;
  sort_order: number;
}

/** Shared shape for both `books` and `notes` tables. */
export interface Material {
  id: string;
  kind: "book" | "note";
  slug: string;
  title: string;
  description: string;
  subject_id: string;
  exam_ids: string[];
  author: string;
  language: Language;
  year: number;
  pages: number;
  /** Storage object key (Supabase Storage) or local path under .data/uploads. */
  file_path: string | null;
  /** Optional path/URL to a preview (first pages) file. */
  preview_path: string | null;
  cover_color: string; // hex, used for generated cover art
  source_license: SourceLicense;
  is_premium: boolean;
  is_published: boolean;
  is_featured: boolean;
  downloads: number;
  views: number;
  created_at: ISODate;
}

export interface PreviousYearPaper {
  id: string;
  exam_id: string;
  subject_id: string | null;
  year: number;
  paper_type: PaperType;
  title: string;
  total_questions: number;
  duration_minutes: number | null;
  language: Language;
  file_path: string | null;
  /** When set, the paper can be attempted as a mock test. */
  mock_test_id: string | null;
  is_premium: boolean;
  is_published: boolean;
  downloads: number;
  created_at: ISODate;
}

export interface Question {
  id: string;
  text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: OptionKey;
  explanation: string;
  subject_id: string;
  exam_id: string | null;
  year: number | null;
  difficulty: Difficulty;
  marks: number;
  negative_marks: number;
  language: Language;
  is_active: boolean;
  created_at: ISODate;
}

export interface MockTest {
  id: string;
  slug: string;
  title: string;
  description: string;
  exam_id: string;
  subject_id: string | null; // null = full-length / mixed
  difficulty: Difficulty;
  duration_minutes: number;
  total_marks: number;
  negative_marks: number; // per wrong answer
  question_count: number;
  is_premium: boolean;
  is_published: boolean;
  is_pyp: boolean; // converted from a previous-year paper
  attempts_count: number;
  created_at: ISODate;
}

export interface MockTestQuestion {
  id: string;
  mock_test_id: string;
  question_id: string;
  sort_order: number;
}

export interface CustomTestConfig {
  exam_id: string;
  subject_id: string | null;
  difficulty: Difficulty | "mixed";
  question_count: number;
}

export interface TestAttempt {
  id: string;
  user_id: string;
  /** Null for custom (ad-hoc) tests generated from the question bank. */
  mock_test_id: string | null;
  title: string;
  exam_id: string;
  subject_id: string | null;
  status: AttemptStatus;
  /** Ordered question ids for this attempt (fixed at start). */
  question_ids: string[];
  config: CustomTestConfig | null;
  duration_minutes: number;
  started_at: ISODate;
  submitted_at: ISODate | null;
  time_taken_seconds: number | null;
  total_questions: number;
  attempted: number;
  correct: number;
  incorrect: number;
  unattempted: number;
  score: number;
  total_marks: number;
  percentage: number;
  accuracy: number;
  percentile: number | null;
  created_at: ISODate;
}

export interface TestAnswer {
  id: string;
  attempt_id: string;
  question_id: string;
  selected_option: OptionKey | null;
  is_correct: boolean | null;
  marked_for_review: boolean;
  time_spent_seconds: number;
  updated_at: ISODate;
}

export interface Bookmark {
  id: string;
  user_id: string;
  item_type: BookmarkType;
  item_id: string;
  created_at: ISODate;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: PlanId;
  status: SubscriptionStatus;
  source: SubscriptionSource;
  starts_at: ISODate;
  ends_at: ISODate;
  payment_id: string | null;
  note: string | null; // admin note for manual activations
  created_at: ISODate;
}

export interface Payment {
  id: string;
  user_id: string;
  plan_id: PlanId;
  amount: number; // in paise
  currency: "INR";
  receipt: string;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  razorpay_signature: string | null;
  status: PaymentStatus;
  method: string | null;
  failure_reason: string | null;
  refund_status: string | null;
  invoice_number: string | null;
  paid_at: ISODate | null;
  created_at: ISODate;
}

export interface StudyProgress {
  id: string;
  user_id: string;
  item_type: ProgressItemType;
  item_id: string;
  progress_percent: number;
  last_position: number | null; // page number for materials
  seconds_spent: number;
  updated_at: ISODate;
}

export interface Announcement {
  id: string;
  type: AnnouncementType;
  title: string;
  body: string;
  link_url: string | null;
  link_label: string | null;
  is_active: boolean;
  starts_at: ISODate | null;
  ends_at: ISODate | null;
  created_at: ISODate;
}

/** Admin-controlled platform settings (single row per key). */
export interface Setting {
  key: string;
  value: SettingsValue;
  updated_at: ISODate;
}

export type SettingsValue =
  | TrialSettings
  | Record<string, string | number | boolean | null>;

export interface TrialSettings {
  trial_days: number;
  /** Which premium features the free trial unlocks. */
  books: boolean;
  notes: boolean;
  papers: boolean;
  mock_tests: boolean;
  solutions: boolean;
  analytics: boolean;
}

/** Pricing plans are static configuration, not a DB table. */
export interface Plan {
  id: PlanId;
  name: string;
  price: number; // rupees
  duration_days: number;
  period_label: string;
  badge: "Popular" | "Best Value" | null;
  savings: number | null; // rupees saved vs monthly
  features: string[];
}

/* -------------------------------------------------------------------------- */
/* Table map                                                                   */
/* -------------------------------------------------------------------------- */

export interface Tables {
  users: User;
  profiles: Profile;
  exams: Exam;
  subjects: Subject;
  books: Material;
  notes: Material;
  previous_year_papers: PreviousYearPaper;
  questions: Question;
  mock_tests: MockTest;
  mock_test_questions: MockTestQuestion;
  test_attempts: TestAttempt;
  test_answers: TestAnswer;
  bookmarks: Bookmark;
  subscriptions: Subscription;
  payments: Payment;
  study_progress: StudyProgress;
  announcements: Announcement;
  settings: Setting;
}

export type TableName = keyof Tables;
export type Row<K extends TableName> = Tables[K];

/** Primary key column per table (all others use `id`). */
export const PRIMARY_KEYS: { [K in TableName]?: keyof Tables[K] } = {
  profiles: "user_id",
  settings: "key",
};

/* -------------------------------------------------------------------------- */
/* Derived / view-model types shared across features                           */
/* -------------------------------------------------------------------------- */

export type PremiumFeature =
  | "books"
  | "notes"
  | "papers"
  | "mock_tests"
  | "solutions"
  | "analytics";

export interface AccessState {
  isAuthenticated: boolean;
  isAdmin: boolean;
  trialActive: boolean;
  trialDaysLeft: number;
  trialEndsAt: ISODate | null;
  subscriptionActive: boolean;
  subscription: Subscription | null;
  /** True when trialActive OR subscriptionActive (or admin). */
  isPremium: boolean;
  /** Feature-level check: subscription unlocks everything; trial unlocks per admin settings. */
  canAccess: (feature: PremiumFeature) => boolean;
}

export interface SessionUser {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  email_verified: boolean;
}
