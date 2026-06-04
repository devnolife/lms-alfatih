import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getCurriculum, getLevelMeta, isStaffRole } from "@/lib/curriculum";
import PendingLink from "@/components/ui/PendingLink";
import MascotSvg from "@/components/MascotSvg";
import BackButton from "@/components/ui/BackButton";

interface PageProps {
  params: Promise<{ n: string }>;
}

const STATUS_LABEL: Record<string, { label: string; bg: string; fg: string }> = {
  COMPLETED: { label: "✓ Selesai", bg: "var(--color-duo-green)", fg: "#fff" },
  IN_PROGRESS: {
    label: "Sedang dikerjakan",
    bg: "var(--color-sunshine)",
    fg: "var(--color-almost-black)",
  },
  NOT_STARTED: {
    label: "Belum dimulai",
    bg: "var(--color-cloud)",
    fg: "var(--color-charcoal)",
  },
};

export default async function LevelPage({ params }: PageProps) {
  const { n } = await params;
  const level = Number(n);
  const meta = getLevelMeta(level);
  if (!meta) notFound();

  const user = await getCurrentUser();
  const groups = await getCurriculum(user?.id, {
    unlockAll: isStaffRole(user?.role),
  });
  const group = groups.find((g) => g.meta.level === level);
  if (!group) notFound();

  if (group.state === "locked") {
    redirect("/learn?locked=1");
  }

  return (
    <div className="max-w-[1140px] mx-auto px-4 sm:px-6 py-8">
      <div className="mb-5">
        <BackButton href="/learn" label="Peta Petualangan" />
      </div>

      <header
        className="dotted-bg relative mb-8 overflow-hidden rounded-3xl border-[3px] border-[var(--color-almost-black)] px-6 py-7 shadow-[0_8px_0_var(--color-almost-black)]"
        style={{ backgroundColor: meta.color }}
      >
        <div className="flex items-center gap-5 text-white">
          <span className="text-5xl" aria-hidden>
            {meta.emoji}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wide">
              <span className="rounded-full bg-black/20 px-3 py-1">
                Level {meta.level}
              </span>
              <span className="rounded-full bg-white/90 px-3 py-1 text-[var(--color-almost-black)]">
                {meta.elementLabel}
              </span>
            </div>
            <h1
              className="mt-3 text-2xl sm:text-3xl"
              style={{ fontFamily: "var(--font-feather)" }}
            >
              {meta.title}
            </h1>
            <p className="mt-1 text-sm text-white/90">{meta.blurb}</p>
          </div>
        </div>
      </header>

      {group.lessons.length === 0 ? (
        <div className="duo-card flex flex-col items-center gap-3 px-6 py-12 text-center">
          <MascotSvg className="w-24 h-24" />
          <p
            className="text-xl"
            style={{ fontFamily: "var(--font-feather)" }}
          >
            Misi sedang disiapkan
          </p>
          <p className="text-sm text-[var(--color-graphite)]">
            Petualangan Level ini akan segera hadir. Tetap semangat! 🚀
          </p>
        </div>
      ) : (
        <>
          {/* Completion banner — clarifies that ALL lessons must be finished */}
          {group.state === "done" ? (
            <div className="mb-5 flex items-center gap-3 rounded-2xl border-[3px] border-[var(--color-almost-black)] bg-[var(--color-duo-green)] px-5 py-4 text-white shadow-[0_4px_0_var(--color-almost-black)]">
              <span className="text-2xl" aria-hidden>🎉</span>
              <p className="text-sm font-bold">
                Level ini sudah LULUS! Semua {group.total} misi selesai — Level
                berikutnya sudah terbuka.
              </p>
            </div>
          ) : (
            <div className="mb-5 rounded-2xl border-[3px] border-[var(--color-almost-black)] bg-[var(--color-sunshine)] px-5 py-4 text-[var(--color-almost-black)] shadow-[0_4px_0_var(--color-almost-black)]">
              <div className="flex items-center gap-3">
                <span className="text-2xl" aria-hidden>📋</span>
                <p className="text-sm font-bold">
                  Kamu sudah menuntaskan {group.completed} dari {group.total} misi.
                  Selesaikan SEMUA misi (status ✓ Selesai) untuk meLULUSkan Level
                  ini & membuka Level {level + 1}.
                </p>
              </div>
              <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-black/15">
                <div
                  className="h-full rounded-full bg-[var(--color-duo-green)] transition-all"
                  style={{ width: `${Math.round((group.completed / group.total) * 100)}%` }}
                />
              </div>
            </div>
          )}
          <ol className="space-y-4">
            {group.lessons.map((lesson, i) => {
              const status = STATUS_LABEL[lesson.status] ?? STATUS_LABEL.NOT_STARTED;
              return (
                <li key={lesson.slug}>
                  <PendingLink
                    href={`/learn/${lesson.slug}`}
                    className="duo-card group flex items-center gap-4 px-5 py-4"
                  >
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-lg font-bold text-white"
                      style={{
                        backgroundColor: meta.color,
                        fontFamily: "var(--font-feather)",
                      }}
                    >
                      {i + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div
                        className="text-lg leading-tight"
                        style={{ fontFamily: "var(--font-feather)" }}
                      >
                        {lesson.title}
                      </div>
                      <p className="mt-1 text-sm text-[var(--color-graphite)]">
                        {lesson.summary}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-wide">
                        <span
                          className="rounded-full px-2.5 py-1"
                          style={{ backgroundColor: status.bg, color: status.fg }}
                        >
                          {status.label}
                        </span>
                        {lesson.estimatedMinutes ? (
                          <span className="rounded-full bg-[var(--color-cloud)] px-2.5 py-1 text-[var(--color-charcoal)]">
                            ⏱ {lesson.estimatedMinutes} mnt
                          </span>
                        ) : null}
                        {lesson.xp > 0 ? (
                          <span className="rounded-full bg-[var(--color-sunshine)] px-2.5 py-1 text-[var(--color-almost-black)]">
                            ⭐ {lesson.xp} XP
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <span className="inline-flex items-center text-sm font-bold text-[var(--color-sky-blue-dark)]">
                      {lesson.status === "COMPLETED" ? "Ulangi" : "Mulai"}
                      <span className="ml-1 transition-transform group-hover:translate-x-1">
                        →
                      </span>
                    </span>
                  </PendingLink>
                </li>
              );
            })}
          </ol>
        </>
      )}
    </div>
  );
}
