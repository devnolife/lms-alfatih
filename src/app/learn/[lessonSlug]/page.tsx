import { notFound, redirect } from "next/navigation";
import { getAllLessons, getLessonBySlug } from "@/lib/content";
import { getCurrentUser } from "@/lib/auth";
import { isLessonLocked } from "@/lib/curriculum";
import LessonPlayer from "@/components/lesson/LessonPlayer";
import MascotSvg from "@/components/MascotSvg";
import BackButton from "@/components/ui/BackButton";

export async function generateStaticParams() {
  const lessons = await getAllLessons();
  return lessons.map((l) => ({ lessonSlug: l.slug }));
}

interface PageProps {
  params: Promise<{ lessonSlug: string }>;
}

export default async function LessonPage({ params }: PageProps) {
  const { lessonSlug } = await params;
  const lesson = await getLessonBySlug(lessonSlug);
  if (!lesson) notFound();

  const user = await getCurrentUser();
  if (await isLessonLocked(lessonSlug, user?.id)) {
    redirect("/learn?locked=1");
  }

  const totalXp = lesson.challenges.reduce(
    (sum, c) => sum + (c.xpReward ?? 0),
    0
  );

  return (
    <div className="max-w-[1140px] mx-auto px-4 sm:px-6 py-8">
      <div className="mb-5">
        <BackButton href="/learn" label="Semua Materi" />
      </div>
      {/* Visual header */}
      <header className="dotted-bg relative mb-8 overflow-hidden rounded-3xl border-[3px] border-[var(--color-almost-black)] bg-[var(--color-duo-green-light)] px-6 py-7 shadow-[0_8px_0_var(--color-almost-black)]">
        <div className="flex items-center gap-5">
          <MascotSvg className="hidden sm:block w-24 h-24 shrink-0 drop-shadow" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wide">
              <span className="rounded-full bg-white px-3 py-1 text-[var(--color-duo-green-dark)]">
                Modul {lesson.order}
              </span>
              <span className="rounded-full bg-[var(--color-grape)] px-3 py-1 text-white">
                {lesson.projectKey}
              </span>
              {lesson.estimatedMinutes ? (
                <span className="rounded-full bg-white px-3 py-1 text-[var(--color-charcoal)]">
                  ⏱ {lesson.estimatedMinutes} menit
                </span>
              ) : null}
              {totalXp > 0 ? (
                <span className="rounded-full bg-[var(--color-sunshine)] px-3 py-1 text-[var(--color-almost-black)]">
                  ⭐ {totalXp} XP
                </span>
              ) : null}
            </div>
            <h1
              className="mt-3 text-2xl sm:text-3xl text-[var(--color-duo-green-dark)]"
              style={{ fontFamily: "var(--font-feather)" }}
            >
              {lesson.title}
            </h1>
            <p className="mt-1 text-sm text-[var(--color-charcoal)]">
              {lesson.summary}
            </p>
          </div>
        </div>
      </header>

      <div className="grid gap-8 lg:items-start">
        <LessonPlayer lesson={lesson} />
      </div>
    </div>
  );
}
