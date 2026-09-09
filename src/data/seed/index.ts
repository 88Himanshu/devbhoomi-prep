import type {
  Announcement, Bookmark, Exam, Material, MockTest, MockTestQuestion, Payment,
  PreviousYearPaper, Profile, Question, Setting, StudyProgress, Subject,
  Subscription, TestAnswer, TestAttempt, User,
} from "@/lib/types";
import { subjects } from "./subjects";
import { exams } from "./exams";
import { books, notes } from "./materials";
import { questions } from "./questions";
import { mockTests, mockTestQuestions } from "./mockTests";
import { papers } from "./papers";
import { announcements } from "./announcements";
import { settings } from "./settings";
import {
  users, profiles, subscriptions, payments, attempts, answers, bookmarks, progress,
} from "./users";

export interface SeedData {
  users: User[];
  profiles: Profile[];
  exams: Exam[];
  subjects: Subject[];
  books: Material[];
  notes: Material[];
  previous_year_papers: PreviousYearPaper[];
  questions: Question[];
  mock_tests: MockTest[];
  mock_test_questions: MockTestQuestion[];
  test_attempts: TestAttempt[];
  test_answers: TestAnswer[];
  bookmarks: Bookmark[];
  subscriptions: Subscription[];
  payments: Payment[];
  study_progress: StudyProgress[];
  announcements: Announcement[];
  settings: Setting[];
}

export function getSeedData(): SeedData {
  return {
    users, profiles, exams, subjects, books, notes,
    previous_year_papers: papers, questions,
    mock_tests: mockTests, mock_test_questions: mockTestQuestions,
    test_attempts: attempts, test_answers: answers, bookmarks,
    subscriptions, payments, study_progress: progress, announcements, settings,
  };
}
