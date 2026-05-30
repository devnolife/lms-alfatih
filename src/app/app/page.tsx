import { getCurrentUser } from "@/lib/auth";
import { getCurriculum } from "@/lib/curriculum";
import { getGlobalLeaderboard } from "@/lib/leaderboard";
import { syncUserBadges, getUserBadges } from "@/lib/badges";
import LevelMap from "@/components/curriculum/LevelMap";
import LeaderboardBoard from "@/components/curriculum/LeaderboardBoard";
import BadgeShelf from "@/components/curriculum/BadgeShelf";
import PendingLink from "@/components/ui/PendingLink";
import MascotSvg from "@/components/MascotSvg";

export default async function AppHome() {
  const user = await getCurrentUser();
  if (!user) return null;

  await syncUserBadges(user.id);
  const [groups, leaderboard, badges] = await Promise.all([
    getCurriculum(user.id),
    getGlobalLeaderboard(user.id),
    getUserBadges(user.id),
  ]);

  const totalXp = groups.reduce((sum, g) => sum + g.xp, 0);
  const lessonCount = groups.reduce((sum, g) => sum + g.total, 0);
  const completedLevels = groups.filter((g) => g.state === "done").length;

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
                📚 {lessonCount} misi
              </span>
              {completedLevels > 0 && (
                <span className="rounded-full bg-white px-3 py-1 text-[var(--color-duo-green-dark)]">
                  🏆 {completedLevels} level selesai
                </span>
              )}
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
        Peta Petualangan Informatika
      </h2>

      <LevelMap groups={groups} />

      <div className="mt-10 grid gap-5 lg:grid-cols-2">
        <LeaderboardBoard
          rows={leaderboard}
          title="Peringkat Sekolah"
          emoji="🏆"
        />
        <BadgeShelf earned={badges} />
      </div>
    </div>
  );
}
