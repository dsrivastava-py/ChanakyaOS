import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-8 w-full">
      <header className="mb-4">
        <Skeleton className="h-4 w-48 mb-4" />
        <Skeleton className="h-12 w-full max-w-2xl" />
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 lg:row-span-2">
          <Skeleton className="w-full h-[400px] rounded-2xl" />
        </div>
        <div className="lg:col-span-2">
          <Skeleton className="w-full h-[200px] rounded-2xl" />
        </div>
        <div className="lg:col-span-2">
          <Skeleton className="w-full h-[200px] rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
