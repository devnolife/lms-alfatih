import { Skeleton } from "@/components/ui/Skeleton";

export default function LessonLoading() {
  return (
    <div className="max-w-[1140px] mx-auto px-6 py-10 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
      <div>
        <Skeleton className="h-3 w-40 mb-3" />
        <Skeleton className="h-9 w-3/4 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-11/12 mb-2" />
        <Skeleton className="h-4 w-4/5 mb-6" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      <div className="bg-white border-2 border-[var(--color-cloud)] rounded-2xl overflow-hidden">
        <Skeleton className="h-[360px] w-full rounded-none" />
        <div className="px-5 py-4">
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    </div>
  );
}
