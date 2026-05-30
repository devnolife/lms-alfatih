import type { LeaderboardRow } from "@/lib/leaderboard";

const MEDAL: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

export default function LeaderboardBoard({
  rows,
  title = "Papan Peringkat",
  emoji = "🏆",
  emptyText = "Belum ada XP. Jadilah yang pertama!",
}: {
  rows: LeaderboardRow[];
  title?: string;
  emoji?: string;
  emptyText?: string;
}) {
  return (
    <div className="rounded-3xl border-[3px] border-[var(--color-almost-black)] bg-white p-5 shadow-[0_6px_0_var(--color-almost-black)]">
      <h3
        className="mb-4 text-xl"
        style={{ fontFamily: "var(--font-feather)" }}
      >
        {emoji} {title}
      </h3>
      {rows.length === 0 ? (
        <p className="py-6 text-center text-sm text-[var(--color-silver)]">
          {emptyText}
        </p>
      ) : (
        <ol className="flex flex-col gap-1.5">
          {rows.map((r) => (
            <li
              key={r.userId}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 ${
                r.isCurrentUser
                  ? "bg-[var(--color-duo-green-light)] ring-2 ring-[var(--color-duo-green)]"
                  : "bg-[var(--color-cloud)]"
              }`}
            >
              <span className="w-7 shrink-0 text-center text-lg font-bold">
                {MEDAL[r.rank] ?? r.rank}
              </span>
              <span className="min-w-0 flex-1 truncate font-bold text-[var(--color-almost-black)]">
                {r.displayName}
                {r.isCurrentUser && (
                  <span className="ml-1 text-xs text-[var(--color-duo-green-dark)]">
                    (kamu)
                  </span>
                )}
              </span>
              <span className="shrink-0 rounded-full bg-[var(--color-sunshine)] px-2.5 py-0.5 text-xs font-bold text-[var(--color-almost-black)]">
                ⭐ {r.xp}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
