import { LEVELS } from "@/lib/curriculum";
import LottiePlayer from "@/components/ui/LottiePlayer";
import type { EarnedBadge } from "@/lib/badges";

/**
 * Shows all curriculum badges, highlighting earned ones and dimming locked
 * ones. The special "Teknisi Muda" badge is shown when earned.
 */
export default function BadgeShelf({ earned }: { earned: EarnedBadge[] }) {
  const earnedMap = new Map(earned.map((b) => [b.code, b]));
  const levelBadges = LEVELS.map((l) => ({
    code: l.badgeCode,
    name: l.title,
    iconKey: l.emoji,
  }));
  const extra = earned.filter(
    (b) => !levelBadges.some((lb) => lb.code === b.code)
  );

  const tiles = [
    ...levelBadges.map((lb) => ({
      code: lb.code,
      name: lb.name,
      iconKey: lb.iconKey,
      got: earnedMap.has(lb.code),
    })),
    ...extra.map((b) => ({
      code: b.code,
      name: b.name,
      iconKey: b.iconKey,
      got: true,
    })),
  ];

  return (
    <div className="rounded-3xl border-[3px] border-[var(--color-almost-black)] bg-white p-5 shadow-[0_6px_0_var(--color-almost-black)]">
      <h3 className="mb-4 text-xl" style={{ fontFamily: "var(--font-feather)" }}>
        🎖️ Lencana Saya
      </h3>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {tiles.map((t) => (
          <div
            key={t.code}
            title={t.name}
            className={`flex flex-col items-center gap-1 rounded-2xl border-2 p-3 text-center ${t.got
              ? "border-[var(--color-sunshine-dark)] bg-[#fff7e0]"
              : "border-[var(--color-cloud)] bg-[var(--color-cloud)] opacity-60"
              }`}
          >
            <span className={`text-3xl ${t.got ? "" : "grayscale"}`}>
              {t.got ? (
                <LottiePlayer
                  src="/lottie/medal.json"
                  className="mx-auto h-12 w-12"
                  fallback={<span className="text-3xl">{t.iconKey}</span>}
                />
              ) : (
                "🔒"
              )}
            </span>
            <span className="text-[11px] font-bold leading-tight text-[var(--color-charcoal)]">
              {t.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
