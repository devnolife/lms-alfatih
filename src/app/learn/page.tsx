import { getAllLessons } from "@/lib/content";
import PendingLink from "@/components/ui/PendingLink";
import BackButton from "@/components/ui/BackButton";

export default async function LearnIndex() {
  const lessons = await getAllLessons();
  return (
    <div className="max-w-[1140px] mx-auto px-6 py-12">
      <div className="mb-5">
        <BackButton href="/app" label="Home" />
      </div>
      <h1
        className="text-4xl mb-6"
        style={{ fontFamily: "var(--font-feather)", color: "var(--color-duo-green)" }}
      >
        Materi Belajar
      </h1>
      <ol className="space-y-4">
        {lessons.map((lesson) => (
          <li key={lesson.slug}>
            <PendingLink
              href={`/learn/${lesson.slug}`}
              className="duo-card group flex items-center gap-4 px-5 py-4"
            >
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-lg font-bold text-white"
                style={{
                  backgroundColor: "var(--color-duo-green)",
                  fontFamily: "var(--font-feather)",
                }}
              >
                {lesson.order}
              </div>
              <div className="min-w-0 flex-1">
                <div
                  className="text-lg leading-tight"
                  style={{ fontFamily: "var(--font-feather)" }}
                >
                  {lesson.title}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-wide">
                  {lesson.estimatedMinutes ? (
                    <span className="rounded-full bg-[var(--color-cloud)] px-2.5 py-1 text-[var(--color-charcoal)]">
                      ⏱ {lesson.estimatedMinutes} mnt
                    </span>
                  ) : null}
                </div>
              </div>
              <span className="inline-flex items-center text-sm text-[var(--color-sky-blue-dark)] font-bold">
                Buka
                <span className="ml-1 transition-transform group-hover:translate-x-1">
                  →
                </span>
              </span>
            </PendingLink>
          </li>
        ))}
      </ol>
    </div>
  );
}
