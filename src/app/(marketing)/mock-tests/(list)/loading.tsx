import { Container, Skeleton } from "@/components/ui/misc";

export default function Loading() {
  return (
    <Container className="py-10">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="mt-3 h-4 w-96 max-w-full" />
      <Skeleton className="mt-6 h-20 w-full" />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64" />)}
      </div>
    </Container>
  );
}
