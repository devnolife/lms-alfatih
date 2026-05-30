import { getCurrentUser } from "@/lib/auth";
import { getAllLessons } from "@/lib/content";
import PendingLink from "@/components/ui/PendingLink";
import MascotSvg from "@/components/MascotSvg";

const ACCENTS = [
  "var(--color-duo-green)",
  "var(--color-sky-blue)",
  "var(--color-grape)",
  "var(--color-sunshine-dark)",
  "var(--color-bubblegum)",
];

export default async function AppHome() {
  const [user, lessons] = await Promise.all([getCurrentUser(), getAllLessons()]);
  if (!user) return null;

  const totalXp = lessons.reduce(
    (sum, l) => sum + l.challenges.reduce((s, c) => s + (c.xpReward ?? 0), 0),
    0
  );

  return (
    <div className="max-w-[1140px] mx-auto px-4 sm:px-6 py-10">
      {/* Visual header */}
      <header className="dotted-bg relative mb-10 overflow-hidden rounded-3xl border-[3px] border-[var(--color-almost-black)] bg-[var(--color-duo-green-light)] px-6 py-7 shadow-[0_8px_0_var(--color-almost-black)]">
        <div className="flex items-center gap-5">
          <MascotSvg className="hidden sm:block w-24 h-24 shrink-0 drop-shadow" />
          <div className="min-w-0">
            <h1
              className="text-3xl sm:text-4xl text-[var(--color-duo-green-dark)]"
              style={{ fontFamily: "var(--font-feather)" }}
            >
              Halo, {user.displayName}! 👋
            </h1>
            <p className="mt-1 text-sm text-[var(--color-charcoal)]">
              Siap untuk petualangan Python hari ini?
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wide">
              <span className="rounded-full bg-white px-3 py-1 text-[var(--color-duo-green-dark)]">
                📚 {lessons.length} modul
              </span>
              {totalXp > 0 && (
                <span className="rounded-full bg-[var(--color-sunshine)] px-3 py-1 text-[var(--color-almost-black)]">
                  ⭐ {totalXp} XP total
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      <PendingLink
        href="/app/games"
        className="group mb-10 flex items-center gap-4 overflow-hidden rounded-3xl border-[3px] border-[var(--color-almost-black)] bg-[var(--color-grape)] px-6 py-5 shadow-[0_6px_0_var(--color-almost-black)] transition-transform hover:-translate-y-0.5"
      >
        <span className="text-4xl">🎮</span>
        <span className="min-w-0 flex-1">
          <span
            className="block text-xl text-white"
            style={{ fontFamily: "var(--font-feather)" }}
          >
            Arena Game
          </span>
          <span className="block text-sm text-white/90">
            Mau main dulu? Coba game blok & teka-teki koding tanpa harus ikut
            pelajaran.
          </span>
        </span>
        <span className="inline-flex shrink-0 items-center rounded-full bg-white px-4 py-2 text-sm font-bold text-[var(--color-grape)]">
          Main
          <span className="ml-1 transition-transform group-hover:translate-x-1">
            ▶
          </span>
        </span>
      </PendingLink>

      <h2 className="text-2xl mb-5" style={{ fontFamily: "var(--font-feather)" }}>
        1-Day Bootcamp Track
      </h2>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {lessons.map((lesson, i) => {
          const accent = ACCENTS[i % ACCENTS.length];
          const lessonXp = lesson.challenges.reduce(
            (s, c) => s + (c.xpReward ?? 0),
            0
          );
          return (
            <PendingLink
              key={lesson.slug}
              href={`/learn/${lesson.slug}`}
              className="duo-card group block p-5"
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-lg font-bold text-white"
                  style={{
                    backgroundColor: accent,
                    fontFamily: "var(--font-feather)",
                  }}
                >
                  {lesson.order}
                </div>
                <div className="text-xs uppercase tracking-wide text-[var(--color-silver)]">
                  Modul {lesson.order}
                  <div className="text-[var(--color-graphite)]">
                    {lesson.projectKey}
                  </div>
                </div>
              </div>

              <div
                className="mt-4 text-xl leading-tight"
                style={{ fontFamily: "var(--font-feather)" }}
              >
                {lesson.title}
              </div>
              <p className="mt-2 text-sm font-normal text-[var(--color-graphite)]">
                {lesson.summary}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-wide">
                {lesson.estimatedMinutes ? (
                  <span className="rounded-full bg-[var(--color-cloud)] px-2.5 py-1 text-[var(--color-charcoal)]">
                    ⏱ {lesson.estimatedMinutes} mnt
                  </span>
                ) : null}
                {lessonXp > 0 ? (
                  <span className="rounded-full bg-[var(--color-sunshine)] px-2.5 py-1 text-[var(--color-almost-black)]">
                    ⭐ {lessonXp} XP
                  </span>
                ) : null}
              </div>

              <div className="mt-4 inline-flex items-center text-sm font-bold text-[var(--color-sky-blue-dark)]">
                Mulai
                <span className="ml-1 transition-transform group-hover:translate-x-1">
                  →
                </span>
              </div>
            </PendingLink>
          );
        })}

        {lessons.length === 0 && (
          <p className="text-[var(--color-silver)]">
            Belum ada lesson yang dipublikasikan.
          </p>
        )}
      </div>
    </div>
  );
}
