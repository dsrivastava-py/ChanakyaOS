import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-8 w-full">
      <header className="mb-4">
        <Skeleton className="h-4 w-40 mb-4" />
        <Skeleton className="h-12 w-full max-w-2xl" />
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Skeleton className="lg:col-span-2 h-[250px] rounded-2xl" />
        <Skeleton className="h-[250px] rounded-2xl" />
        <Skeleton className="h-[200px] rounded-2xl" />
        <Skeleton className="h-[200px] rounded-2xl" />
        <Skeleton className="h-[200px] rounded-2xl" />
      </div>
    </div>
  );
}
