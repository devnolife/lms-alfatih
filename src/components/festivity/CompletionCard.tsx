"use client";

import MascotSvg from "@/components/MascotSvg";
import { useReward } from "@/components/festivity/RewardProvider";

/**
 * Celebratory overlay shown when a lesson is finished. Confetti + sound are
 * fired by the caller (LessonPlayer); this just shows the festive summary.
 */
export default function CompletionCard({
  lessonTitle,
  href = "/app",
}: {
  lessonTitle: string;
  href?: string;
}) {
  const { sessionXp } = useReward();
  return (
    <div className="fixed inset-0 z-[65] flex items-center justify-center bg-black/40 px-4">
      <div className="fx-zoom-in w-full max-w-md rounded-3xl border-[3px] border-[var(--color-almost-black)] bg-white p-7 text-center shadow-[0_10px_0_var(--color-almost-black)]">
        <MascotSvg className="mx-auto h-28 w-28" mood="cheer" />
        <h2
          className="mt-2 text-3xl text-[var(--color-duo-green-dark)]"
          style={{ fontFamily: "var(--font-feather)" }}
        >
          🎉 Pelajaran Selesai!
        </h2>
        <p className="mt-2 text-sm text-[var(--color-charcoal)]">
          Kamu menyelesaikan <strong>{lessonTitle}</strong>. Keren banget! 👏
        </p>

        {sessionXp > 0 && (
          <div className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full bg-[var(--color-sunshine)] px-5 py-2 text-base font-bold text-[var(--color-almost-black)]">
            ⭐ {sessionXp} XP latihan terkumpul!
          </div>
        )}

        <a
          href={href}
          className="btn-3d mt-6 block w-full rounded-2xl bg-[var(--color-duo-green)] px-6 py-3 text-base font-bold uppercase tracking-wide text-white shadow-[0_4px_0_var(--color-duo-green-dark)]"
        >
          Kembali ke Beranda →
        </a>
      </div>
    </div>
  );
}
