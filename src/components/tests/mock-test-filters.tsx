"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input, Select } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

export function MockTestFilters({ exams, subjects }: { exams: { id: string; name: string }[]; subjects: { id: string; name: string }[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const get = (k: string) => params.get(k) ?? "";
  const update = (k: string, v: string) => {
    const next = new URLSearchParams(params.toString());
    if (v) next.set(k, v); else next.delete(k);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };
  const hasFilters = ["q", "exam", "subject", "difficulty", "access"].some((k) => get(k));
  return (
    <form
      className="grid gap-3 rounded-card border border-ink-200 bg-white p-4 shadow-card md:grid-cols-[1.4fr_1fr_1fr_0.8fr_0.8fr_auto]"
      onSubmit={(e) => { e.preventDefault(); update("q", (new FormData(e.currentTarget).get("q") as string) ?? ""); }}
      role="search"
    >
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" aria-hidden="true" />
        <Input name="q" defaultValue={get("q")} placeholder="Search tests…" className="pl-9" aria-label="Search mock tests" />
      </div>
      <Select aria-label="Exam" value={get("exam")} onChange={(e) => update("exam", e.target.value)}>
        <option value="">All exams</option>
        {exams.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
      </Select>
      <Select aria-label="Subject" value={get("subject")} onChange={(e) => update("subject", e.target.value)}>
        <option value="">All subjects</option>
        <option value="full">Full length</option>
        {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
      </Select>
      <Select aria-label="Difficulty" value={get("difficulty")} onChange={(e) => update("difficulty", e.target.value)}>
        <option value="">Any level</option>
        <option value="easy">Easy</option>
        <option value="medium">Medium</option>
        <option value="hard">Hard</option>
      </Select>
      <Select aria-label="Access" value={get("access")} onChange={(e) => update("access", e.target.value)}>
        <option value="">Free & Premium</option>
        <option value="free">Free only</option>
        <option value="premium">Premium only</option>
      </Select>
      <div className="flex gap-2">
        <Button type="submit" size="md" className="flex-1 md:flex-none">Search</Button>
        {hasFilters && (
          <Button type="button" variant="ghost" size="icon" aria-label="Clear filters" onClick={() => router.replace(pathname)}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </form>
  );
}
