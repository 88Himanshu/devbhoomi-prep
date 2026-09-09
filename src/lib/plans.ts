import type { Plan, PlanId } from "./types";

export const PLANS: Plan[] = [
  {
    id: "monthly",
    name: "Monthly",
    price: 199,
    duration_days: 30,
    period_label: "/month",
    badge: null,
    savings: null,
    features: [
      "Full Books & Notes Library",
      "All Previous Year Papers",
      "Unlimited Mock Tests",
      "Detailed Solutions",
      "Performance Analytics",
      "Bookmarks & Progress Tracking",
    ],
  },
  {
    id: "quarterly",
    name: "3 Months",
    price: 499,
    duration_days: 90,
    period_label: "/3 months",
    badge: "Popular",
    savings: 98,
    features: ["Everything in Premium", "3 Months Full Access", "Save ₹98"],
  },
  {
    id: "yearly",
    name: "Yearly",
    price: 1499,
    duration_days: 365,
    period_label: "/year",
    badge: "Best Value",
    savings: 889,
    features: ["Everything in Premium", "12 Months Full Access", "Save ₹889"],
  },
];

export const FREE_TRIAL_FEATURES = [
  "30 Days Free Trial",
  "Study Materials",
  "Previous Year Papers",
  "Mock Tests",
  "Student Dashboard",
];

export function getPlan(id: PlanId): Plan {
  const plan = PLANS.find((p) => p.id === id);
  if (!plan) throw new Error(`Unknown plan: ${id}`);
  return plan;
}

export function isPlanId(value: unknown): value is PlanId {
  return value === "monthly" || value === "quarterly" || value === "yearly";
}

export const formatINR = (rupees: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(rupees);
