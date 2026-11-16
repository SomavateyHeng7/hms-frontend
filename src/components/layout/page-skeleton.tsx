import { Skeleton } from "@/components/ui/skeleton";

/** Generic loading placeholder: tab bar, stat cards, and a content card. */
export function PageSkeleton() {
  return (
    <div className="container mx-auto space-y-6 px-4 py-8" aria-busy="true" aria-label="Loading">
      <Skeleton className="h-10 w-full max-w-xl" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
      <Skeleton className="h-72 w-full" />
    </div>
  );
}
