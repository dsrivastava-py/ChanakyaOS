import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6 w-full" role="status" aria-label="Loading">
      <Skeleton className="h-10 w-full max-w-md" />
      <Skeleton className="w-full h-[320px] rounded-2xl" />
    </div>
  );
}
