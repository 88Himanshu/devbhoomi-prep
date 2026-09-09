import { createElement } from "react";
import {
  BookOpenCheck, Briefcase, Building2, FileText, GraduationCap, Landmark, Layers, MapPinned, Shield, Tractor, TreePine,
  Mountain, Globe, Newspaper, Languages, BookOpenText, Calculator, Puzzle, Monitor, BookOpen, type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  Landmark, Building2, Shield, MapPinned, Tractor, FileText, TreePine, Layers, GraduationCap, BookOpenCheck, Briefcase,
  Mountain, Globe, Newspaper, Languages, BookOpenText, Calculator, Puzzle, Monitor, BookOpen,
};

/** Resolve a lucide icon by name (exam.icon / subject.icon) with a safe fallback. */
export function iconFor(name: string | null | undefined): LucideIcon {
  return (name && ICONS[name]) || Landmark;
}

export function ExamIcon({ name, className }: { name: string; className?: string }) {
  return createElement(iconFor(name), { className, "aria-hidden": true });
}
