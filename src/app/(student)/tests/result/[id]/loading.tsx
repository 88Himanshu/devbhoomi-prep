import { Skeleton } from "@/components/ui/misc";

export default function Loading() {
  return (
    <div>
      <Skeleton className="h-4 w-40" />
      <Skeleton className="mt-4 h-8 w-80 max-w-full" />
      <Skeleton className="mt-6 h-40 w-full" />
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">{Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2"><Skeleton className="h-64" /><Skeleton className="h-64" /></div>
    </div>
  );
}
