import { Container, Skeleton } from "@/components/ui/misc";

export function LibrarySkeleton() {
  return (
    <Container className="py-10">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-3 h-8 w-64" />
      <Skeleton className="mt-2 h-4 w-96 max-w-full" />
      <Skeleton className="mt-6 h-28 w-full" />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-60" />)}
      </div>
    </Container>
  );
}

export function DetailSkeleton() {
  return (
    <Container className="py-10">
      <Skeleton className="h-4 w-48" />
      <div className="mt-6 flex gap-6">
        <Skeleton className="h-56 w-40 shrink-0" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-11 w-72" />
        </div>
      </div>
      <Skeleton className="mt-10 h-[60vh] w-full" />
    </Container>
  );
}
