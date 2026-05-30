import { Skeleton } from "@/components/ui/Skeleton";

export default function LearnIndexLoading() {
  return (
    <div className="max-w-[1140px] mx-auto px-6 py-12">
      <Skeleton className="h-10 w-60 mb-6" />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-[68px] w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
