import { Skeleton } from "@/components/ui/Skeleton";

export default function AppHomeLoading() {
  return (
    <div className="max-w-[1140px] mx-auto px-6 py-12">
      <Skeleton className="h-10 w-72 mb-3" />
      <Skeleton className="h-5 w-56 mb-10" />
      <Skeleton className="h-7 w-52 mb-4" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="bg-white border-2 border-[var(--color-cloud)] rounded-2xl p-6"
          >
            <Skeleton className="h-3 w-16 mb-3" />
            <Skeleton className="h-6 w-3/4 mb-3" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        ))}
      </div>
    </div>
  );
}
