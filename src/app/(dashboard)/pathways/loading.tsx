import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-8 w-full">
      <header className="mb-4 flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="w-full max-w-3xl">
          <Skeleton className="h-4 w-40 mb-4" />
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-16 w-full" />
        </div>
        <Skeleton className="h-12 w-48 rounded-xl shrink-0" />
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="w-full h-[350px] rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
