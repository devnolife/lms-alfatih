import PendingLink from "@/components/ui/PendingLink";
import LottiePlayer from "@/components/ui/LottiePlayer";
import type { LevelGroup } from "@/lib/curriculum";

function StatePill({ group }: { group: LevelGroup }) {
  const { state, completed, total } = group;
  if (state === "empty")
    return (
      <span className="rounded-full bg-[var(--color-cloud)] px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[var(--color-silver)]">
        Segera hadir
      </span>
    );
  if (state === "locked")
    return (
      <span className="rounded-full bg-[var(--color-cloud)] px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[var(--color-graphite)]">
        🔒 Terkunci
      </span>
    );
  if (state === "done")
    return (
      <span className="rounded-full bg-[var(--color-duo-green)] px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
        ✓ Selesai
      </span>
    );
  return (
    <span className="rounded-full bg-[var(--color-sunshine)] px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[var(--color-almost-black)]">
      {completed > 0 ? `${completed}/${total} misi` : "Siap dimulai"}
    </span>
  );
}

function LevelCard({ group, blockedBy }: { group: LevelGroup; blockedBy?: number }) {
  const { meta, state, completed, total, xp } = group;
  const clickable = state === "open" || state === "done";
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
  const remaining = total - completed;

  const inner = (
    <div
      className={`relative flex items-center gap-4 rounded-3xl border-[3px] border-[var(--color-almost-black)] p-5 shadow-[0_6px_0_var(--color-almost-black)] transition-transform ${clickable ? "hover:-translate-y-0.5" : "opacity-70"
        }`}
      style={{ backgroundColor: clickable ? meta.color : "var(--color-cloud)" }}
    >
      <div
        className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/85 text-3xl"
        aria-hidden
      >
        {state === "locked" ? (
          "🔒"
        ) : meta.lottie ? (
          <LottiePlayer
            src={meta.lottie}
            className="h-14 w-14"
            fallback={<span className="text-3xl">{meta.emoji}</span>}
          />
        ) : (
          meta.emoji
        )}
      </div>
      <div className="min-w-0 flex-1 text-white">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-black/20 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide">
            Level {meta.level}
          </span>
          <StatePill group={group} />
        </div>
        <h3
          className={`mt-1 text-xl leading-tight ${clickable ? "text-white" : "text-[var(--color-charcoal)]"}`}
          style={{ fontFamily: "var(--font-feather)" }}
        >
          {meta.title}
        </h3>
        <p
          className={`text-sm ${clickable ? "text-white/90" : "text-[var(--color-graphite)]"}`}
        >
          {meta.elementLabel} · {meta.blurb}
        </p>
        {total > 0 && (
          <div className="mt-3 flex items-center gap-3">
            <div className="h-2.5 w-full max-w-[220px] overflow-hidden rounded-full bg-black/20">
              <div
                className="h-full rounded-full bg-white"
                style={{ width: `${progress}%` }}
              />
            </div>
            {xp > 0 && (
              <span
                className={`shrink-0 text-[11px] font-bold uppercase tracking-wide ${clickable ? "text-white" : "text-[var(--color-graphite)]"}`}
              >
                ⭐ {xp} XP
              </span>
            )}
          </div>
        )}

        {/* Helper line: what the learner needs to do */}
        {state === "open" && remaining > 0 && (
          <p className="mt-2 text-xs font-bold text-white/90">
            ⚡ Selesaikan {remaining} misi lagi untuk meLULUSkan Level ini &
            membuka Level {meta.level + 1}.
          </p>
        )}
        {state === "locked" && (
          <p className="mt-2 text-xs font-bold text-[var(--color-graphite)]">
            🔒 Harus LULUS Level {blockedBy ?? meta.level - 1} dulu (selesaikan
            semua misinya) baru Level ini terbuka.
          </p>
        )}
      </div>
    </div>
  );

  if (clickable) {
    return (
      <PendingLink href={`/learn/level/${meta.level}`} className="block">
        {inner}
      </PendingLink>
    );
  }
  return <div aria-disabled>{inner}</div>;
}

export default function LevelMap({ groups }: { groups: LevelGroup[] }) {
  // For each locked level, find the first PRIOR non-empty level that isn't done
  // — that's the one the learner must finish to unlock it.
  const blockerFor = (index: number): number | undefined => {
    for (let i = index - 1; i >= 0; i--) {
      const g = groups[i];
      if (g.state !== "empty" && g.state !== "done") return g.meta.level;
    }
    return undefined;
  };

  return (
    <div className="flex flex-col gap-4">
      {groups.map((g, i) => (
        <LevelCard
          key={g.meta.level}
          group={g}
          blockedBy={g.state === "locked" ? blockerFor(i) : undefined}
        />
      ))}
    </div>
  );
}
