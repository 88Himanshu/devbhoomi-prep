import { Skeleton } from "@/components/ui/misc";

export default function Loading() {
  return (
    <div>
      <Skeleton className="h-8 w-72" />
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2"><Skeleton className="h-72" /><Skeleton className="h-72" /><Skeleton className="h-72" /><Skeleton className="h-72" /></div>
    </div>
  );
}
