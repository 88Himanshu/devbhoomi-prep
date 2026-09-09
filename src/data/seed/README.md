# Seed data contract

Each file exports a typed array (or object) built from `@/lib/types`. `index.ts` combines them into a
`SeedData` object consumed by the demo store (`src/lib/data/demo-store.ts`) and by the SQL seed generator.

| File               | Export                              | Notes |
|--------------------|-------------------------------------|-------|
| `subjects.ts`      | `subjects: Subject[]`               | ids like `sub_uk_gk`, `sub_hindi`, `sub_english`, `sub_math`, `sub_reasoning`, `sub_gs`, `sub_current`, `sub_computer`, `sub_pedagogy`, `sub_env` |
| `exams.ts`         | `exams: Exam[]`                     | ids like `exam_ukpsc`; slugs must match SEO: `ukpsc`, `uksssc`, `police`, `patwari-lekhpal`, `vdo`, `junior-assistant`, `forest-guard`, `group-c`, `teaching`, `uttarakhand-tet`, `other` |
| `materials.ts`     | `books: Material[]`, `notes: Material[]` | kind must match the array |
| `questions.ts`     | `questions: Question[]`             | ids `q_0001`… ; realistic, factual, original wording |
| `mockTests.ts`     | `mockTests: MockTest[]`, `mockTestQuestions: MockTestQuestion[]` | question_count must equal linked rows |
| `papers.ts`        | `papers: PreviousYearPaper[]`       | link some to mock tests via `mock_test_id` |
| `announcements.ts` | `announcements: Announcement[]`     | |
| `settings.ts`      | `settings: Setting[]`               | must include key `trial` with `TrialSettings` |
| `users.ts`         | `users`, `profiles`, `subscriptions`, `payments`, `attempts`, `answers`, `bookmarks`, `progress` | demo accounts + realistic history |

All `created_at` values are fixed ISO strings (deterministic). Use `SEED_NOW` from `./constants.ts`.
