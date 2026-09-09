import type { Setting } from "@/lib/types";
import { SEED_NOW } from "./constants";

export const settings: Setting[] = [
  {
    key: "trial",
    value: {
      trial_days: 30,
      books: true,
      notes: true,
      papers: true,
      mock_tests: true,
      solutions: true,
      analytics: true,
    },
    updated_at: SEED_NOW,
  },
  {
    key: "site",
    value: {
      support_email: "support@devbhoomiprep.in",
      support_phone: "+91 94100 00000",
      address: "Dehradun, Uttarakhand",
    },
    updated_at: SEED_NOW,
  },
];
