import { Skeleton } from "@/components/ui/Skeleton";

export default function LearnIndexLoading() {
  return (
    <div className="max-w-[1140px] mx-auto px-6 py-12">
      <Skeleton className="h-8 w-24 mb-5 rounded-xl" />
      <Skeleton className="h-10 w-72 mb-3" />
      <Skeleton className="h-4 w-full max-w-[520px] mb-8" />
      <div className="flex flex-col gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-3xl border-[3px] border-[var(--color-cloud)] bg-white p-5 shadow-[0_6px_0_var(--color-cloud)]"
          >
            <Skeleton className="h-16 w-16 shrink-0 rounded-2xl" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Skeleton className="h-4 w-16 rounded-full" />
                <Skeleton className="h-4 w-20 rounded-full" />
              </div>
              <Skeleton className="h-5 w-1/2 mb-2" />
              <Skeleton className="h-3.5 w-3/4 mb-3" />
              <div className="flex items-center gap-3">
                <Skeleton className="h-2.5 w-full max-w-[220px] rounded-full" />
                <Skeleton className="h-3 w-12 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
