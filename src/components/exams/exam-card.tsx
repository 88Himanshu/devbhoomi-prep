import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Exam } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExamIcon } from "./exam-icon";

export function ExamCard({ exam, mocks, papers }: { exam: Exam; mocks?: number; papers?: number }) {
  return (
    <Link href={`/exams/${exam.slug}`} className="group block h-full">
      <Card hover className="flex h-full flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
            <ExamIcon name={exam.icon} className="h-5 w-5" />
          </span>
          <Badge tone="outline">{exam.conducting_body}</Badge>
        </div>
        <h3 className="mt-4 text-base font-semibold text-ink-900 group-hover:text-brand-800">{exam.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-ink-500">{exam.tagline}</p>
        <div className="mt-auto flex items-center justify-between pt-4 text-xs text-ink-500">
          <span>
            {mocks !== undefined && <>{mocks} mock {mocks === 1 ? "test" : "tests"}</>}
            {mocks !== undefined && papers !== undefined && " · "}
            {papers !== undefined && <>{papers} {papers === 1 ? "paper" : "papers"}</>}
          </span>
          <span className="flex items-center gap-1 font-medium text-brand-700">
            Explore <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </span>
        </div>
      </Card>
    </Link>
  );
}
