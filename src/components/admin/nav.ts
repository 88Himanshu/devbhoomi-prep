import {
  BookOpen, ClipboardList, CreditCard, FileQuestion, FileText, Landmark, LayoutDashboard, Megaphone, NotebookPen, Settings, Users, Wallet,
} from "lucide-react";

export const ADMIN_NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/students", label: "Students", icon: Users },
  { href: "/admin/exams", label: "Exams", icon: Landmark },
  { href: "/admin/books", label: "Books", icon: BookOpen },
  { href: "/admin/notes", label: "Notes", icon: NotebookPen },
  { href: "/admin/papers", label: "Previous Papers", icon: FileText },
  { href: "/admin/mock-tests", label: "Mock Tests", icon: ClipboardList },
  { href: "/admin/questions", label: "Questions", icon: FileQuestion },
  { href: "/admin/subscriptions", label: "Subscriptions", icon: Wallet },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/homepage", label: "Homepage", icon: Megaphone },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];
