import { Skeleton } from "@/components/ui/misc";

export default function DashboardLoading() {
  return (
    <div className="grid gap-6" aria-busy="true" aria-label="Loading dashboard">
      <div className="grid gap-2"><Skeleton className="h-8 w-56" /><Skeleton className="h-4 w-72" /></div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
      </div>
      <div className="grid gap-5 lg:grid-cols-2"><Skeleton className="h-56" /><Skeleton className="h-56" /></div>
      <div className="grid gap-5 lg:grid-cols-2"><Skeleton className="h-72" /><Skeleton className="h-72" /></div>
    </div>
  );
}
